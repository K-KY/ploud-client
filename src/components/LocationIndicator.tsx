import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import styles from "../styles/LocationIndicator.module.css";

type Props = {
    currentDirStack: DirectoryInfo[];
}

export function LocationIndicator({ currentDirStack }: Props) {
    const segments = ["내 드라이브", ...currentDirStack.map(dir => dir.dirName)];

    return (
        <div className={styles.breadcrumb}>
            {segments.map((segment, index) => (
                <span key={`${segment}-${index}`} className={styles.segment}>
                    {index > 0 && <span className={styles.separator}>/</span>}
                    <span className={index === segments.length - 1 ? styles.current : styles.label}>
                        {segment}
                    </span>
                </span>
            ))}
        </div>
    )
}
