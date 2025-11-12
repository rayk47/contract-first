import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Skeleton } from "antd";

// Lazy load each page
const HomePage = lazy(() => import("../pages/home-page"));
const ApiDocsPage = lazy(() => import("../pages/api-docs-page"));

export const Router = () => (
    <Suspense fallback={<Skeleton></Skeleton>}>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
        </Routes>
    </Suspense>
);