export default [
    {
        path: "/plans/create",
        name: "PlanCreateForm",
        component: () => import("@/views/plan/PlanCreatePage.vue"),
    },
    {
        path: "/plans/:planId/edit",
        name: "PlanRouteEditor",
        component: () => import("@/views/plan/PlanRouteEditor.vue"),
        props: true,
    },

    {
        path: "/plans",
        name: "getPlansList",
        component: () => import("@/views/plan/GetPlansListPage.vue"),
        props: true,
    },
    {
        path: "/plans/:planId",
        name: "getPlanDetail",
        component: () => import("@/views/plan/GetPlanDetailPage.vue"),
        props: true,
    },
    {
        path: "/plans/all",
        name: "getTotalPlanList",
        component: () => import("@/views/plan/GetTotalPlansListPage.vue"),
        props: true,
    },
    {
        path: "/plans/:planId/copy",
        name: "getSharePlanDetail",
        component: () => import("@/views/plan/GetSharePlanDetailPage.vue"),
        props: true,
    },
    {
        path: "/plans/copy",
        name: "getSharedPlanList",
        component: () => import("@/views/plan/GetSharedPlansListPage.vue"),
        props: true,
    },
    {
        path: "/plans/:planId/shared",
        name: "getSharedPlanDetail",
        component: () => import("@/views/plan/GetSharedPlanDetailPage.vue"),
        props: true,
    },
];
