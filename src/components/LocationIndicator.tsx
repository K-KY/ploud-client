import styles from "../styles/LocationIndicator.module.css";
import {useDirTreeStore} from "../service/dir/DirTreeStore.ts";

type Props = {
    currentDir: number;
}

export function LocationIndicator({currentDir}: Props) {
    const parentRegistry = useDirTreeStore(state => state.parentRegistry);
    const nameRegistry = useDirTreeStore(state => state.nameRegistry);

    const segments = buildPath(currentDir, parentRegistry, nameRegistry);
    function buildPath(
        currentDirId: number,
        parentRegistry: Record<number, number | null>,
        nameRegistry: Record<number, string>
    ) {
        const segments: string[] = [];

        let current: number | null = currentDirId;

        while (current != null) {
            const name = nameRegistry[current];

            if (name) {
                segments.unshift(decodeURIComponent(name));
            }

            current = parentRegistry[current] ?? null;
        }

        segments.unshift("내 드라이브");
        return segments;
    }
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
