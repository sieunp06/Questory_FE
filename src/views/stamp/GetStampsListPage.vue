<template>
    <div class="stamp-collection-page">
        <!-- 메인 컨텐츠 영역 -->
        <main class="main-content">
            <h2 class="title">나의 스탬프 컬렉션</h2>
            <div class="title-underline"></div>

            <p class="description">퀘스트를 완료하여 얻은 스탬프들을 확인해보세요!</p>

            <!-- 필터 버튼 -->
            <div class="filter-buttons">
                <button
                    class="filter-btn"
                    :class="{ active: selectedDifficulty === 'all' }"
                    @click="filterStamps('all')"
                >
                    전체
                </button>
                <button
                    class="filter-btn"
                    :class="{ active: selectedDifficulty === 'EASY' }"
                    @click="filterStamps('EASY')"
                >
                    EASY
                </button>
                <button
                    class="filter-btn"
                    :class="{ active: selectedDifficulty === 'MEDIUM' }"
                    @click="filterStamps('MEDIUM')"
                >
                    MEDIUM
                </button>
                <button
                    class="filter-btn"
                    :class="{ active: selectedDifficulty === 'HARD' }"
                    @click="filterStamps('HARD')"
                >
                    HARD
                </button>
            </div>

            <!-- 스탬프 카드 그리드 -->
            <div class="stamp-grid">
                <div v-for="stamp in filteredStamps" :key="stamp.id" class="stamp-card">
                    <div class="stamp-image">
                        <div class="circle">
                            <img
                                :src="require(`@/assets/images/stamps/${stamp.url}.png`)"
                                alt="이미지 찾을 수 없음"
                                class="circle"
                            />
                        </div>
                    </div>
                    <div class="stamp-info">
                        <h3 class="stamp-title">{{ stamp.title }}</h3>
                        <div class="stamp-date">{{ stamp.date }}</div>
                        <div class="stamp-tags">
                            <span class="tag">{{ stamp.contentTypeTitle }}</span>
                            <span class="tag">{{ stamp.sidoName }}</span>
                        </div>
                        <button class="detail-btn" @click="openDetailModal(stamp)">상세보기</button>
                    </div>
                </div>
            </div>

            <!-- 페이지네이션 -->
            <div v-if="pagination.totalPages > 1" class="pagination">
                <!-- 첫 페이지 이동 버튼 -->
                <button class="pagination-btn" :disabled="pagination.currentPage === 1" @click="changePage(1)">
                    &laquo;
                </button>

                <!-- 이전 페이지 이동 버튼 -->
                <button
                    class="pagination-btn"
                    :disabled="pagination.currentPage === 1"
                    @click="changePage(pagination.currentPage - 1)"
                >
                    &lsaquo;
                </button>

                <!-- 페이지 번호 버튼 -->
                <button
                    v-for="page in visiblePageNumbers"
                    :key="page"
                    class="pagination-btn"
                    :class="{ active: pagination.currentPage === page }"
                    @click="changePage(page)"
                >
                    {{ page }}
                </button>

                <!-- 다음 페이지 이동 버튼 -->
                <button
                    class="pagination-btn"
                    :disabled="pagination.currentPage === pagination.totalPages"
                    @click="changePage(pagination.currentPage + 1)"
                >
                    &rsaquo;
                </button>

                <!-- 마지막 페이지 이동 버튼 -->
                <button
                    class="pagination-btn"
                    :disabled="pagination.currentPage === pagination.totalPages"
                    @click="changePage(pagination.totalPages)"
                >
                    &raquo;
                </button>
            </div>
        </main>

        <!-- 상세 정보 모달 -->
        <div class="modal-overlay" v-if="selectedStamp" @click.self="closeDetailModal">
            <div class="modal-content">
                <button class="close-btn" @click="closeDetailModal">×</button>
                <h3 class="modal-title">{{ selectedStamp.title }}</h3>
                <div class="stamp-detail-image">
                    <div class="circle large">
                        <img
                            :src="require(`@/assets/images/stamps/${selectedStamp.url}.png`)"
                            alt="이미지 찾을 수 없음"
                            class="circle large"
                        />
                    </div>
                </div>
                <div class="stamp-detail-info">
                    <p class="stamp-date">획득 날짜: {{ selectedStamp.date }}</p>
                    <div class="stamp-tags">
                        <span class="tag">{{ selectedStamp.contentTypeTitle }}</span>
                        <span class="tag">{{ selectedStamp.sidoName }}</span>
                    </div>
                    <div class="difficulty-badge" :class="selectedStamp.difficulty.toLowerCase()">
                        {{ selectedStamp.difficulty }}
                    </div>
                    <p class="stamp-description">
                        {{ selectedStamp.description }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// API 기본 URL
const API_URL = "http://localhost:8080";

// 인증 스토어 가져오기
const authStore = useAuthStore();

export default {
    name: "StampCollection",
    data() {
        return {
            selectedDifficulty: "all",
            selectedStamp: null,
            stamps: [],
            pagination: {
                currentPage: 1,
                totalItems: 0,
                totalPages: 0,
                pageSize: 6,
            },
            loading: false,
            error: null,
        };
    },
    created() {
        // 컴포넌트가 생성될 때 스탬프 데이터 로드
        this.fetchStamps();
    },
    computed: {
        filteredStamps() {
            if (this.selectedDifficulty === "all") {
                return this.stamps;
            }
            return this.stamps.filter((stamp) => stamp.difficulty === this.selectedDifficulty);
        },
    },
    methods: {
        // 백엔드에서 스탬프 데이터 가져오기
        fetchStamps() {
            this.loading = true;
            this.error = null;

            const token = authStore.accessToken;

            if (!token) {
                this.error = "로그인이 필요합니다.";
                this.loading = false;
                return;
            }

            axios
                .get(`${API_URL}/stamps`, {
                    params: {
                        page: this.pagination.currentPage,
                        size: this.pagination.pageSize,
                        difficulty: this.selectedDifficulty === "all" ? null : this.selectedDifficulty,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    const { stamps, pagination } = response.data;

                    // 스탬프 데이터 변환 (백엔드 DTO 형식에 맞게 조정)
                    this.stamps = stamps.map((stamp) => ({
                        id: stamp.id || Math.random().toString(),
                        title: stamp.title,
                        url: stamp.contentTypeId, // 실제 이미지 URL로 변경 필요
                        date: this.formatDate(stamp.date),
                        contentTypeTitle: `# ${stamp.contentTypeName}`,
                        sidoName: `# ${stamp.sidoName}`,
                        difficulty: stamp.difficulty,
                        description: stamp.description || "설명이 없습니다.",
                    }));

                    // 페이지네이션 정보 업데이트
                    this.pagination = pagination;
                })
                .catch((error) => {
                    console.error("스탬프 데이터를 불러오는 중 오류가 발생했습니다:", error);

                    if (error.response) {
                        // 서버 응답이 있는 경우
                        if (error.response.status === 401) {
                            this.error = "인증이 만료되었습니다. 다시 로그인해주세요.";
                            // 로그인 페이지로 리다이렉트 (필요시)
                            // this.$router.push('/login');
                        } else {
                            this.error = `오류가 발생했습니다: ${error.response.data.message || "알 수 없는 오류"}`;
                        }
                    } else {
                        this.error = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 날짜 형식 변환 (YYYY-MM-DD -> YYYY.MM.DD)
        formatDate(dateString) {
            if (!dateString) return "";

            // ISO 형식 또는 문자열 날짜를 처리
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}.${month}.${day}`;
        },
        // 페이지 변경 처리
        changePage(page) {
            this.pagination.currentPage = page;
            this.fetchStamps();
        },
        filterStamps(difficulty) {
            this.selectedDifficulty = difficulty;
            this.pagination.currentPage = 1;
            this.fetchStamps();
        },
        openDetailModal(stamp) {
            this.selectedStamp = stamp;
            document.body.style.overflow = "hidden"; // 모달 열릴 때 배경 스크롤 방지
        },
        closeDetailModal() {
            this.selectedStamp = null;
            document.body.style.overflow = ""; // 모달 닫힐 때 배경 스크롤 복원
        },
    },
};
</script>

<style scoped>
/* 기본 스타일 및 리셋 */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: "Noto Sans KR", sans-serif;
    color: #333;
    background-color: #fff;
}

/* 메인 컨텐츠 스타일 */
.main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.title {
    text-align: center;
    color: #4a90e2;
    font-size: 1.8rem;
    margin-top: 1rem;
}

.title-underline {
    width: 200px;
    height: 3px;
    background-color: #4a90e2;
    margin: 0.5rem auto 1.5rem;
}

.description {
    text-align: center;
    color: #666;
    margin-bottom: 1.5rem;
}

/* 필터 버튼 스타일 */
.filter-buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.filter-btn {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 18px;
    padding: 0.5rem 1rem;
    margin: 0 0.3rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-btn.active {
    background-color: #4a90e2;
    color: white;
    border-color: #4a90e2;
}

.filter-btn:hover:not(.active) {
    background-color: #f8f9fa;
}

/* 스탬프 그리드 스타일 */
.stamp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
}

.stamp-card {
    background-color: #f8f9fa;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
}

.stamp-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stamp-image {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
}

.circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 0.8rem;
    text-align: center;
    padding: 0.5rem;
}

.circle.large {
    width: 150px;
    height: 150px;
    font-size: 1rem;
}

.stamp-info {
    padding: 1rem 1.5rem 1.5rem;
}

.stamp-title {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    text-align: center;
}

.stamp-date {
    background-color: #666;
    color: white;
    border-radius: 4px;
    padding: 0.3rem 0.5rem;
    text-align: center;
    font-size: 0.8rem;
    margin-bottom: 1rem;
    width: fit-content;
    /* min-width: 80px; */
    box-sizing: border-box;
    margin-left: auto;
}

.stamp-tags {
    margin-bottom: 1rem;
}

.tag {
    color: #777;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 0.3rem;
}

.detail-btn {
    background-color: #5a9bd8;
    color: white;
    border: none;
    border-radius: 15px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.3s;
}

.detail-btn:hover {
    background-color: #4a90e2;
}

/* 페이지네이션 스타일 */
.pagination {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
    gap: 0.5rem;
}

.pagination-btn {
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pagination-btn.active {
    background-color: #4a90e2;
    color: white;
    border-color: #4a90e2;
}

.pagination-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.pagination-btn:hover:not(:disabled):not(.active) {
    background-color: #f8f9fa;
}

/* 모달 스타일 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: #fff;
    border-radius: 10px;
    padding: 2rem;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
}

.modal-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #4a90e2;
}

.stamp-detail-image {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.stamp-detail-info {
    text-align: center;
}

.difficulty-badge {
    display: inline-block;
    padding: 0.3rem 1rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: bold;
    color: white;
    margin: 1rem 0;
}

.difficulty-badge.easy {
    background-color: #28a745;
}

.difficulty-badge.medium {
    background-color: #fd7e14;
}

.difficulty-badge.hard {
    background-color: #dc3545;
}

.stamp-description {
    margin-bottom: 0.5rem;
    text-align: left;
    line-height: 1.6;
}

/* 반응형 스타일 */
@media (max-width: 960px) {
    .stamp-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
}

@media (max-width: 768px) {
    .header {
        flex-direction: column;
        padding: 1rem;
    }

    .logo {
        margin-bottom: 1rem;
    }

    .navigation ul {
        flex-wrap: wrap;
        justify-content: center;
    }

    .navigation li {
        margin: 0.5rem;
    }

    .profile {
        margin-top: 1rem;
    }

    .stamp-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }

    .filter-buttons {
        flex-wrap: wrap;
    }

    .filter-btn {
        margin: 0.3rem;
    }
}

@media (max-width: 480px) {
    .stamp-grid {
        grid-template-columns: 1fr;
    }

    .modal-content {
        width: 95%;
        padding: 1.5rem;
    }

    .title {
        font-size: 1.5rem;
    }

    .description {
        font-size: 0.9rem;
    }
}
</style>
