import StyledComponentsRegistry from '@/lib/registry'
import Header from "@/components/Header";
import {AuthContextProvider} from "@/context/AuthContext";
import Providers from "@/app/providers";
import dayjs from "dayjs";
import {CookiesProvider} from 'next-client-cookies/server';
import {AppContextProvider} from "@/context/AppContext";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import {theme} from "@/styles/themes";
import './globals.css'

const  advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)


// either Static metadata
export const metadata = {
    title: 'Gymfriends',
}
export default function AuthedLayout({ children }) {

    return (
        <html>
        <head>
            <meta name='viewport' content='width=device-width, initial-scale=1.0, viewport-fit=cover' />
            <meta name='theme-color' content={theme.TIMBERWOLF} />
            <meta name='apple-mobile-web-app-status-bar-style' content={theme.TIMBERWOLF} />
        </head>
        <body>
        <StyledComponentsRegistry>
            <Providers>
                <CookiesProvider>
                    <AuthContextProvider>
                       <AppContextProvider>
                           <NavigationProgressBar />
                           <Header />
                           {children}
                       </AppContextProvider>

                    </AuthContextProvider>
                </CookiesProvider>
            </Providers>
        </StyledComponentsRegistry>
        </body>
        </html>
    )
}
