## WikiLink

### 通常

#### 存在するリンク

[[スペース「 」「　」・記号込]]
[[ディレクトリ配下]]
[[ディレクトリ配下#HEADING2]]
[[ディレクトリ配下|ディレクトリ配下・エイリアス確認]]
[[PNG.png]]
[[PDF.pdf]]
[[#WikiLink]]
[[ORIGINAL]]→自己リンク

#### 存在しない

[[デッドリンク]]
[[img.png]]

### 埋め込みリンク

※マークダウンの埋め込みは[[COMMON]]側で[[ORIGINAL]]の埋め込みを確認すること

![[ORIGINAL]]→自己リンク
![[COMMON]]→循環自己リンク

#### PNG

##### 100

![[PNG.png|100]]

##### 100の横並び

![[PNG.png|100]]![[PNG.png|100]]![[PNG.png|100]]文字列

##### 指定なし（150×150）

![[PNG.png]]

#### 200

![[PNG.png|200]]

##### 存在しない

![[img.png]]

##### 破損

![[TEXT.png]]

#### JPG

![[JPG.jpg]]

#### PDF

![[PDF.pdf]]

#### BMP

![[BMP.bmp]]

#### GIF

![[GIF.gif]]

#### MP4

![[MP4.mp4]]

## CALLOUT

> 通常のblockquote
> Callout指定なし

> [!NOTE]
> リンク:[[COMMON]]
> 埋込![[JPG.jpg]]

> [!NOTE]- 開閉
> コンテンツ

> [!abstract]
> Lorem ipsum dolor sit amet

> [!WARNING]
> WARNING 表示

> [!info]
> Lorem ipsum dolor sit amet

> [!todo]
> Lorem ipsum dolor sit amet

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!success]
> Lorem ipsum dolor sit amet

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

> [!question]
> Lorem ipsum dolor sit amet

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!failure]
> Lorem ipsum dolor sit amet

> [!danger]
> Lorem ipsum dolor sit amet

> [!bug]
> Lorem ipsum dolor sit amet

> [!example]
> Lorem ipsum dolor sit amet

> [!quote]
> Lorem ipsum dolor sit amet

## Tag

#tag
文章中の#tag

## Code

### Typescript（デフォ）

```ts
type WikiLinkData = {};

interface WikiLink extends Literal {
	type: "wikiLink";
	embed?: boolean;
	data?: WikiLinkData;
	value: string;
}
```

### React

```react
() => {
	const [isClicked, setIsClicked] = useState(false);

	return (
		<div
			style={{
				color: isClicked ? "red" : "black",
				cursor: 'pointer',
			}}
			onClick={() => setIsClicked(true)}
		>
			Hello!!
		</div>
	);
};
```

### k4aDataView

```k4aDataView
() => {
    return <TaskTemplate/>
}

```
