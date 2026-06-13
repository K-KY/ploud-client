import styles from "../styles/LocationIndicator.module.css";
import {useDirTreeStore} from "../service/dir/DirTreeStore.ts";
export function LocationIndicator() {
    const tree = useDirTreeStore((state) => state.tree);
    const currentPath = useDirTreeStore((state) => state.currentPath);

    const segments = [
        "내 드라이브",
        ...currentPath
            .map((dirSeq) => tree[dirSeq]?.dirName ?? "")
            .filter((dirName) => dirName.trim().length > 0),
    ];

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
