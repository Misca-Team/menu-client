import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
    return (<>
        <div className="h-screen"
            style={{
                background: "linear-gradient(40deg, #d9e8e6, #eee6e2)",
            }}>
            {children}
        </div>
    </>
    )
}