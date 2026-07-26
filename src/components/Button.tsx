import styles from "../styles/Button.module.css";
import type {ButtonProp} from "../types/ButtonProps.ts";

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
