export default function Layout(props: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen justify-start items-center">
            {props.children}
        </div>
    );
}
