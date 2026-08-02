import {FileViewer} from "./FileViewer.tsx";
import {Button} from "./Button.tsx";
import {LinearLayout} from "./LinearLayout.tsx";
import {useNavigate} from "react-router-dom";
import {logout} from "../axios/UserApi.ts";
import {userAuthStore} from "../stores/token.store.ts";
import {LocationIndicator} from "./LocationIndicator.tsx";
import styles from "../styles/Home.module.css";
import {type FormEvent, useEffect, useRef, useState} from "react";
import {searchStorage} from "../axios/StorageApi.ts";
import type {SearchResponse} from "../types/StorageApiTypes.ts";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import type {FileInfo} from "../types/FileInfo.ts";

export function Home() {
    const navigate = useNavigate();
    const searchPanelRef = useRef<HTMLFormElement>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
    const [activeSearchKeyword, setActiveSearchKeyword] = useState("");
    const [suggestions, setSuggestions] = useState<SearchResponse | null>(null);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);

    useEffect(() => {
        const keyword = searchKeyword.trim();

        if (!keyword) {
            setSuggestions(null);
            setIsSuggestionsOpen(false);
            setIsSuggesting(false);
            return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            setIsSuggesting(true);

            try {
                const nextSuggestions = await searchStorage(keyword, 6, controller.signal);
                setSuggestions(nextSuggestions);
                setIsSuggestionsOpen(true);
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("자동완성 검색 실패:", error);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsSuggesting(false);
                }
            }
        }, 500);

        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [searchKeyword]);

    useEffect(() => {
        function closeSuggestionsOnOutsideClick(event: MouseEvent) {
            if (searchPanelRef.current?.contains(event.target as Node)) {
                return;
            }

            setIsSuggestionsOpen(false);
        }

        document.addEventListener("mousedown", closeSuggestionsOnOutsideClick);
        return () => document.removeEventListener("mousedown", closeSuggestionsOnOutsideClick);
    }, []);

    function fileUpload() {
        navigate("/upload")
    }

    async function handleLogout() {
        try {
            await logout();

            userAuthStore.getState().logout();

            localStorage.removeItem("accessToken");

            window.location.replace("/ploud/login");
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    }

    async function handleSearchSubmit(event?: FormEvent<HTMLFormElement>, keywordOverride?: string) {
        event?.preventDefault();

        const keyword = (keywordOverride ?? searchKeyword).trim();

        if (!keyword) {
            clearSearch();
            return;
        }

        setIsSearching(true);

        try {
            const result = await searchStorage(keyword, 50);
            setSearchResult(result);
            setActiveSearchKeyword(result.keyword || keyword);
            setSearchKeyword(keyword);
            setSuggestions(null);
            setIsSuggestionsOpen(false);
        } catch (error) {
            console.error("검색 실패:", error);
        } finally {
            setIsSearching(false);
        }
    }

    function clearSearch() {
        setSearchKeyword("");
        setSearchResult(null);
        setActiveSearchKeyword("");
        setSuggestions(null);
        setIsSuggestionsOpen(false);
    }

    function getDirSuggestionName(dir: DirectoryInfo) {
        return dir.dirName || "이름 없는 폴더";
    }

    function getFileSuggestionName(file: FileInfo) {
        return file.title || file.originalFilename || "이름 없는 파일";
    }

    return (
        <div className={styles.page}>
            <div className={styles.shell}>
                {/*헤더*/}
                <div className={styles.hero}>
                    <div>
                        <p className={styles.eyebrow}>PLOUD</p>
                    </div>
                    <LinearLayout className={styles.toolbar} justify={"end"} gap={"0.75rem"}>
                        <Button onClick={fileUpload} content={"파일 업로드"}/>
                        <Button onClick={handleLogout} content={"로그아웃"}/>
                    </LinearLayout>
                </div>

                <form ref={searchPanelRef} className={styles.searchPanel} onSubmit={(event) => handleSearchSubmit(event)}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchIcon}>Search</span>
                        <input
                            className={styles.searchInput}
                            value={searchKeyword}
                            onChange={(event) => setSearchKeyword(event.target.value)}
                            onFocus={() => setIsSuggestionsOpen(Boolean(suggestions))}
                            placeholder="파일 또는 폴더 검색"
                            aria-label="파일 또는 폴더 검색"
                        />
                        {activeSearchKeyword ? (
                            <button type="button" className={styles.clearSearchButton} onClick={clearSearch}>
                                초기화
                            </button>
                        ) : null}
                        <button
                            type="submit"
                            className={styles.searchButton}
                            disabled={isSearching || searchKeyword.trim().length === 0}
                        >
                            {isSearching ? "검색 중" : "검색"}
                        </button>

                        {isSuggestionsOpen ? (
                            <div className={styles.suggestionDropdown}>
                                {isSuggesting ? (
                                    <div className={styles.suggestionState}>자동완성 검색 중</div>
                                ) : null}
                                {(suggestions?.dirs ?? []).map((dir) => (
                                    <button
                                        type="button"
                                        className={styles.suggestionItem}
                                        key={`dir-${dir.dirSeq}`}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            handleSearchSubmit(undefined, getDirSuggestionName(dir));
                                        }}
                                    >
                                        <span className={styles.suggestionType}>폴더</span>
                                        <span className={styles.suggestionName}>{getDirSuggestionName(dir)}</span>
                                    </button>
                                ))}
                                {(suggestions?.files ?? []).map((file) => (
                                    <button
                                        type="button"
                                        className={styles.suggestionItem}
                                        key={`file-${file.fileSeq}`}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            handleSearchSubmit(undefined, getFileSuggestionName(file));
                                        }}
                                    >
                                        <span className={styles.suggestionType}>파일</span>
                                        <span className={styles.suggestionName}>{getFileSuggestionName(file)}</span>
                                    </button>
                                ))}
                                {!isSuggesting && suggestions && (suggestions.dirs ?? []).length === 0 && (suggestions.files ?? []).length === 0 ? (
                                    <div className={styles.suggestionState}>자동완성 결과가 없습니다</div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </form>

                <LocationIndicator onNavigate={clearSearch} />
                <FileViewer
                    searchResult={searchResult}
                    searchKeyword={activeSearchKeyword}
                    onClearSearch={clearSearch}
                />
            </div>
        </div>
    )
}
