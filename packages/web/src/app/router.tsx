import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Skeleton } from "antd";

// Lazy load each page
const HomePage = lazy(() => import("../pages/home-page"));

export const Router = () => (
    <Suspense fallback={<Skeleton></Skeleton>}>
        <Routes>
            <Route path="/" element={<HomePage />} />
        </Routes>
    </Suspense>
);