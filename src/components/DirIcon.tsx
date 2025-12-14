import styles from "../styles/IconStyle.module.css"

interface DirIconPros {
    children?: React.ReactNode;
}

const DirIcon = ({children}: DirIconPros) => {
    return (
        <div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M3 7h5l2 3h11v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
            </svg>
            <a className={`${styles.iconTitle}`}>{children}</a>

        </div>

    )
}

export {DirIcon}