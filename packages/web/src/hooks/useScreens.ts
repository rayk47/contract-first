import { Grid } from "antd";

export function useScreens() {
    const screens = Grid.useBreakpoint();

    return screens;
}