import { ReactNode } from 'react';
import { Layout, Typography } from 'antd';
import { useScreens } from '../hooks/useScreens';

const { Content, Header, Footer } = Layout;

interface MainLayoutProps {
    children: ReactNode;
};

export function MainLayout(props: MainLayoutProps) {
    const screens = useScreens();
    const maxWidth = screens.xxl ? 1200 : screens.xl ? 1000 : '95%';
    const borderRadius = screens.xs ? 12 : 8;

    return (
        <Layout style={{
            minHeight: '100vh', background: 'transparent', display: 'flex',
            flexDirection: 'column'
        }}>
            <Header style={{
                height: '100%',
                background: 'black',
                maxWidth,
                margin: '0 auto',
                width: '100%',
                padding: '10px',
                borderRadius
            }} >
                <Typography.Title style={{ margin: 5, color: 'white' }} level={4}>CONTRACT FIRST DEVELOPMENT</Typography.Title>
            </Header>
            <Content style={{
                background: 'white',
                flex: 1,
                maxWidth,
                margin: '0 auto',
                width: '100%',
                padding: '10px',
                borderRadius,
                marginBottom: screens.xs ? 10 : 10,
                marginTop: screens.xs ? 10 : 10

            }}>
                {props.children}
            </Content>
            <Footer style={{
                textAlign: 'center',
                background: 'white',
                maxWidth,
                borderRadius,
                margin: '0 auto',
                width: '100%',
                fontSize: '10px',
            }}>
                © {new Date().getFullYear()} Contract First Development by Raymond Kelly
            </Footer>
        </Layout>
    );
}