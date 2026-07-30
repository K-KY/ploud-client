# Ploud

사용자는 브라우저에서 로그인한 뒤 파일과 디렉토리를 탐색하고, 파일 업로드, 다운로드, 검색, 이름 변경, 이동, 삭제 같은 스토리지 작업을 수행할 수 있습니다. 실제 파일 데이터는 객체 스토리지로 직접 업로드하고, 프론트는 백엔드 API를 통해 presigned URL 발급, 메타데이터 저장, 디렉토리 탐색 상태 갱신을 조율합니다.

## 주요 역할

### 인증 흐름

로그인, 회원가입, access token 갱신 흐름을 담당합니다. 앱 최초 진입 시 refresh 요청으로 인증 상태를 확인하고, 보호된 화면은 `Private` 컴포넌트를 통해 접근을 제한합니다.

### 파일 및 디렉토리 탐색

`FileViewer`를 중심으로 현재 디렉토리의 하위 디렉토리와 파일 목록을 조회합니다. URL path의 디렉토리 번호를 기준으로 현재 위치를 결정하고, 디렉토리 계층 정보는 `DirTreeStore`에 저장해 breadcrumb와 이동 판단에 사용합니다.

### 파일 업로드

파일 선택 업로드와 드래그 앤 드롭 업로드를 지원합니다. 업로드는 다음 순서로 진행됩니다.

```text
파일 선택 또는 드롭
-> 백엔드에 presigned URL 요청
-> 클라이언트가 객체 스토리지로 PUT 업로드
-> 업로드 응답의 ETag 수집
-> 백엔드에 파일 메타데이터 저장
-> 현재 디렉토리 목록 갱신
```

대량 파일 업로드 시 브라우저와 서버에 요청이 한꺼번에 몰리지 않도록 업로드 흐름을 분리하고, 파일별 상태와 진행률을 화면에 반영합니다.

### 파일 관리

파일과 디렉토리의 이름 변경, 삭제, 이동, 다운로드를 API 호출로 연결합니다. 앱 내부 드래그 앤 드롭은 별도의 MIME payload를 사용해 사용자가 파일 또는 디렉토리를 다른 디렉토리로 옮길 수 있게 구성했습니다.

### 검색

파일명과 디렉토리명을 기준으로 검색 API를 호출하고, 검색 결과가 있는 동안에는 현재 디렉토리 목록 대신 검색 결과를 표시합니다.

## 기술 스택

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 파일 구조

```text
ploud
├── Dockerfile
├── README.md
├── eslint.config.js
├── index.html
├── nginx.conf
├── package-lock.json
├── package.json
├── public
│   ├── favicon.png
│   └── vite.svg
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── assets
│   │   ├── dotIcon.svg
│   │   └── react.svg
│   ├── axios
│   │   ├── MetadataApi.ts
│   │   ├── StorageApi.ts
│   │   └── UserApi.ts
│   ├── components
│   │   ├── ActionMenu.tsx
│   │   ├── BoarderLayout.tsx
│   │   ├── Button.tsx
│   │   ├── DirIcon.tsx
│   │   ├── FileIcon.tsx
│   │   ├── FileUploader.tsx
│   │   ├── FileViewer.tsx
│   │   ├── HlsPlayer.tsx
│   │   ├── Home.tsx
│   │   ├── LinearLayout.tsx
│   │   ├── LocationIndicator.tsx
│   │   ├── LoginPage.tsx
│   │   ├── Private.tsx
│   │   ├── Public.tsx
│   │   ├── Signup.tsx
│   │   └── fileUploader.md
│   ├── index.css
│   ├── main.tsx
│   ├── service
│   │   ├── dir
│   │   │   ├── DirTreeStore.ts
│   │   │   └── dir.md
│   │   └── upload
│   │       └── uploadDroppedFiles.ts
│   ├── stores
│   │   └── token.store.ts
│   ├── styles
│   │   ├── ActionMenu.module.css
│   │   ├── Button.module.css
│   │   ├── FileUploader.module.css
│   │   ├── FileViewer.module.css
│   │   ├── Home.module.css
│   │   ├── IconStyle.module.css
│   │   ├── LocationIndicator.module.css
│   │   ├── LoginPage.module.css
│   │   └── Signup.module.css
│   ├── types
│   │   ├── ActionMenuTypes.ts
│   │   ├── AuthStoreTypes.ts
│   │   ├── ButtonProps.ts
│   │   ├── DirHierarchyInfo.ts
│   │   ├── DirTreeTypes.ts
│   │   ├── DirectoryInfo.ts
│   │   ├── FileInfo.ts
│   │   ├── FileSystemEntry.d.ts
│   │   ├── FileViewerTypes.ts
│   │   ├── FileWithId.ts
│   │   ├── HlsPlayerProps.ts
│   │   ├── IconProps.ts
│   │   ├── KeyAndPath.ts
│   │   ├── LayoutProps.ts
│   │   ├── LoginForm.ts
│   │   ├── SignupTypes.ts
│   │   ├── StorageApiTypes.ts
│   │   ├── StorageInfo.ts
│   │   ├── StorageRequest.ts
│   │   ├── UploadDroppedFileTypes.ts
│   │   └── UploadStatus.ts
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 디렉토리 설명

- `src/axios`: 백엔드 API 호출 모듈입니다. 인증 토큰 주입, refresh 후 재요청, 스토리지/메타데이터/사용자 API 호출을 담당합니다.
- `src/components`: 화면을 구성하는 React 컴포넌트입니다. 로그인, 회원가입, 파일 탐색기, 업로더, 액션 메뉴, 아이콘 컴포넌트가 포함됩니다.
- `src/service/dir`: 디렉토리 트리와 현재 경로 상태를 관리합니다.
- `src/service/upload`: 드래그 앤 드롭으로 전달된 파일/디렉토리 항목을 순회하고 업로드 요청 흐름을 처리합니다.
- `src/stores`: 전역 인증 상태를 관리합니다.
- `src/styles`: CSS Module 기반 화면 스타일입니다.
- `src/types`: API 응답, 컴포넌트 props, 업로드 상태, 파일/디렉토리 모델 타입을 정의합니다.

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```
