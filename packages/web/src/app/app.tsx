import { MainLayout } from '../pages/main-layout';
import { Router } from './router';
import { ConfigProvider, App as AntdApp } from "antd";
import { useScreens } from "../hooks/useScreens";

export function App() {
  const screens = useScreens();

  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#000301ff',
        colorSuccess: '#FFD700',
        colorWarning: '#C62828',
        colorError: '#B22222',
        colorInfo: '#1565C0',
        borderRadius: screens.xs ? 12 : 8,
        fontSize: screens.xs ? 16 : 17,
        controlHeight: screens.xs ? 38 : 32,
        padding: screens.xs ? 16 : 18,
        margin: screens.xs ? 12 : 14
      },
    }} componentSize={screens.xs ? 'middle' : 'middle'}>
      <AntdApp>
        <MainLayout>
          <Router />
        </MainLayout>
      </AntdApp>
    </ConfigProvider>

  );
}

export default App;