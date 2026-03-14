import styles from "../styles/LoginPage.module.css";

interface ButtonProp {
    onClick: () => void;
    content: string;
}

export const Button = ({ onClick, content }: ButtonProp) => {
    return (
        <div className={styles.buttonWrapper}>
            <button
                onClick={onClick}
                className={`${styles.button} ${styles.buttonPrimary} ${styles.flexColCenterGapSm}`}
            >
                {content}
            </button>
        </div>
    );
};