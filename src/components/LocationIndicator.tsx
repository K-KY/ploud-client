import styles from "../styles/LocationIndicator.module.css";
import {useDirTreeStore} from "../service/dir/DirTreeStore.ts";
import {useNavigate} from "react-router-dom";
import type {LocationIndicatorProps} from "../types/LocationIndicatorTypes.ts";

export function LocationIndicator({onNavigate}: LocationIndicatorProps) {
    const navigate = useNavigate();
    const tree = useDirTreeStore((state) => state.tree);
    const currentPath = useDirTreeStore((state) => state.currentPath);

    const segments = [
        {
            label: "내 드라이브",
            dirSeq: 0,
        },
        ...currentPath
            .map((dirSeq) => ({
                label: tree[dirSeq]?.dirName ?? "",
                dirSeq,
            }))
            .filter((segment) => segment.label.trim().length > 0),
    ];

    function moveTo(dirSeq: number) {
        onNavigate?.();

        if (dirSeq === 0) {
            navigate("/");
            return;
        }

        navigate(`/${dirSeq}`);
    }

    return (
        <div className={styles.breadcrumb}>
            {segments.map((segment, index) => (
                <span key={`${segment.dirSeq}-${index}`} className={styles.segment}>
                    {index > 0 && <span className={styles.separator}>/</span>}
                    <button
                        type="button"
                        className={index === segments.length - 1 ? styles.current : styles.label}
                        onClick={() => moveTo(segment.dirSeq)}
                        disabled={index === segments.length - 1}
                    >
                        {segment.label}
                    </button>
                </span>
            ))}
        </div>
    )
}
