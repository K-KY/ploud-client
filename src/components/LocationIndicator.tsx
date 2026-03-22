import type {DirectoryInfo} from "../types/DirectoryInfo.ts";

type Props = {
    currentDirStack: DirectoryInfo[];
}

export function LocationIndicator({ currentDirStack }: Props) {


    const path = currentDirStack
        .map(dir => dir.dirName)
        .join(" / ");

    return (
        <div>
            <legend>{path || "root"}</legend>
        </div>
    )
}
