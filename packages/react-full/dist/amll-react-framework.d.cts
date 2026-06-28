import React$1, { ComponentProps, FC, ForwardRefExoticComponent, HTMLProps, NamedExoticComponent, PropsWithChildren, ReactNode, RefAttributes } from "react";
import { LyricLine, LyricLineMouseEvent, LyricPlayerBase, OptimizeLyricOptions } from "@applemusic-like-lyrics/core";
import { BackgroundRenderProps, LyricPlayerRef } from "@applemusic-like-lyrics/react";
import { PrimitiveAtom, WritableAtom } from "jotai";
import { RESET } from "jotai/utils";

//#region src/components/AudioFFTVisualizer/index.d.ts
declare const AudioFFTVisualizer: FC<{
  fftData: number[];
} & HTMLProps<HTMLCanvasElement>>;
//#endregion
//#region src/components/AudioQualityTag/index.d.ts
type AudioQualityTagProps = {
  isDolbyAtmos?: boolean;
  tagText?: string;
  tagIcon?: boolean;
} & HTMLProps<HTMLDivElement>;
declare const AudioQualityTag: NamedExoticComponent<Omit<AudioQualityTagProps, "ref"> & RefAttributes<HTMLDivElement>>;
//#endregion
//#region src/components/BouncingSlider/index.d.ts
interface SliderProps {
  className?: string;
  style?: React$1.CSSProperties;
  value: number;
  min: number;
  max: number;
  isPlaying?: boolean;
  onChange?: (v: number) => void;
  onAfterChange?: (v: number) => void;
  onBeforeChange?: () => void;
  onSeeking?: (v: boolean) => void;
  beforeIcon?: React$1.ReactNode;
  afterIcon?: React$1.ReactNode;
  changeOnDrag?: boolean;
}
declare const BouncingSlider: React$1.FC<SliderProps>;
//#endregion
//#region src/components/ControlThumb/index.d.ts
declare const ControlThumb: FC<{
  onClick?: () => void;
} & HTMLProps<HTMLDivElement>>;
//#endregion
//#region src/components/Cover/index.d.ts
type CoverProps = {
  coverUrl?: string;
  coverIsVideo?: boolean;
  coverVideoPaused?: boolean;
  musicPaused?: boolean;
  pauseShrinkAspect?: number;
} & HTMLProps<HTMLDivElement>;
/**
* 一个专辑图组件
*/
declare const Cover: ForwardRefExoticComponent<CoverProps & RefAttributes<HTMLDivElement>>;
//#endregion
//#region src/components/MediaButton/index.d.ts
declare const MediaButton: FC<ComponentProps<"button">>;
//#endregion
//#region src/components/MenuButton/index.d.ts
declare const MenuButton: React.FC<HTMLProps<HTMLButtonElement>>;
//#endregion
//#region src/components/MusicInfo/index.d.ts
declare const MusicInfo: React.FC<{
  name?: string;
  artists?: string[];
  album?: string;
  onArtistClicked?: (artist: string, index: number) => void;
  onAlbumClicked?: () => void;
  onMenuButtonClicked?: () => void;
} & HTMLProps<HTMLDivElement>>;
//#endregion
//#region src/components/PrebuiltLyricPlayer/index.d.ts
interface PrebuiltLyricPlayerProps extends HTMLProps<HTMLDivElement> {
  bottomLineSlot?: React$1.ReactNode;
  optimizeOptions?: OptimizeLyricOptions;
}
/**
* 已经部署好所有组件的歌词播放器组件，在正确设置所有的 Jotai 状态后可以开箱即用
*/
declare const PrebuiltLyricPlayer: FC<PrebuiltLyricPlayerProps>;
//#endregion
//#region src/components/TextMarquee/index.d.ts
declare const TextMarquee: FC<PropsWithChildren<HTMLProps<HTMLDivElement>>>;
//#endregion
//#region src/components/ToggleIconButton/prebuilt-enum.d.ts
declare enum PrebuiltToggleIconButtonType {
  Lyrics = "lyrics",
  Playlist = "playlist",
  Repeat = "repeat",
  Shuffle = "shuffle",
  Star = "star",
  AirPlay = "airplay"
}
//#endregion
//#region src/components/ToggleIconButton/index.d.ts
declare const ToggleIconButton: FC<{
  uncheckedIcon: ReactNode;
  checkedIcon: ReactNode;
  checked?: boolean;
} & Omit<HTMLProps<HTMLButtonElement>, "type">>;
declare const PrebuiltToggleIconButton: FC<{
  type: PrebuiltToggleIconButtonType;
  checked?: boolean;
} & Omit<HTMLProps<HTMLButtonElement>, "type">>;
//#endregion
//#region src/components/VolumeControlSlider/index.d.ts
declare const VolumeControl: React$1.FC<SliderProps>;
//#endregion
//#region src/layout/auto.d.ts
/**
* 会根据当前元素的宽高比自动选择横向或者纵向布局的组件
*/
declare const AutoLyricLayout: React$1.FC<{
  thumbSlot?: React$1.ReactNode;
  controlsSlot?: React$1.ReactNode;
  horizontalBottomControls?: React$1.ReactNode;
  smallControlsSlot?: React$1.ReactNode;
  bigControlsSlot?: React$1.ReactNode;
  coverSlot?: React$1.ReactNode;
  lyricSlot?: React$1.ReactNode;
  backgroundSlot?: React$1.ReactNode;
  hideLyric?: boolean;
  verticalImmerseCover?: boolean;
  onLayoutChange?: (isVertical: boolean) => void;
  onElementMounted?: (node: HTMLDivElement | null) => void;
} & HTMLProps<HTMLDivElement>>;
//#endregion
//#region src/layout/horizontal.d.ts
declare const HorizontalLayout: React$1.FC<{
  thumbSlot?: React$1.ReactNode;
  coverSlot?: React$1.ReactNode;
  controlsSlot?: React$1.ReactNode;
  lyricSlot?: React$1.ReactNode;
  backgroundSlot?: React$1.ReactNode;
  bottomControls?: React$1.ReactNode;
  hideLyric?: boolean;
  asChild?: boolean;
} & HTMLProps<HTMLDivElement>>;
//#endregion
//#region src/layout/vertical.d.ts
declare const VerticalLayout: React$1.FC<{
  thumbSlot?: React$1.ReactNode;
  smallControlsSlot?: React$1.ReactNode;
  bigControlsSlot?: React$1.ReactNode;
  coverSlot?: React$1.ReactNode;
  lyricSlot?: React$1.ReactNode;
  asChild?: boolean;
  hideLyric?: boolean;
  immerseCover?: boolean;
} & HTMLProps<HTMLDivElement>>;
//#endregion
//#region src/states/callbacks.d.ts
interface Callback<Args extends unknown[], Result = void> {
  onEmit?: (...args: Args) => Result;
}
/**
* 点击歌曲专辑图上方的控制横条时触发
*
* 通常用于关闭歌词页面
*/
declare const onClickControlThumbAtom: PrimitiveAtom<Callback<[], void>>;
/**
* 点击音质标签时触发
*
* 通常用于打开音质详情对话框
*/
declare const onClickAudioQualityTagAtom: PrimitiveAtom<Callback<[], void>>;
/**
* 点击菜单按钮时触发
*/
declare const onRequestOpenMenuAtom: PrimitiveAtom<Callback<[], void>>;
/**
* 点击暂停或播放按钮时触发
*/
declare const onPlayOrResumeAtom: PrimitiveAtom<Callback<[], void>>;
/**
* 点击上一首按钮时触发
*/
declare const onRequestPrevSongAtom: PrimitiveAtom<Callback<[], void>>;
/**
* 点击下一首按钮时触发
*/
declare const onRequestNextSongAtom: PrimitiveAtom<Callback<[], void>>;
/**
* 拖动进度条触发跳转时触发
* @param position - 目标播放位置，单位为毫秒
*/
declare const onSeekPositionAtom: PrimitiveAtom<Callback<[_position: number], void>>;
/**
* 当某个歌词行被左键点击时触发
* @param _evt 歌词行的事件对象，可以访问到对应的歌词行信息和歌词行索引
* @param _playerRef 歌词播放组件的引用
*/
declare const onLyricLineClickAtom: PrimitiveAtom<Callback<[_evt: LyricLineMouseEvent, _playerRef: LyricPlayerRef | null], void>>;
/**
* 当某个歌词行被右键点击时触发
* @param _evt 歌词行的事件对象，可以访问到对应的歌词行信息和歌词行索引
* @param _playerRef 歌词播放组件的引用
*/
declare const onLyricLineContextMenuAtom: PrimitiveAtom<Callback<[_evt: LyricLineMouseEvent, _playerRef: LyricPlayerRef | null], void>>;
/**
* 通过音量滑块改变音量时触发
* @param volume - 目标音量，取值范围为 [0-1]
*/
declare const onChangeVolumeAtom: PrimitiveAtom<Callback<[_volume: number], void>>;
/**
* 点击随机按钮时触发
*/
declare const onToggleShuffleAtom: PrimitiveAtom<Callback<[], void>>;
/**
* 点击循环按钮时触发
*/
declare const onCycleRepeatModeAtom: PrimitiveAtom<Callback<[], void>>;
//#endregion
//#region src/states/configAtoms.d.ts
/**
* 播放器底部控制区域的控制组件类型
* - `Controls`: 播放控制按钮
* - `FFT`: 音频可视化内容
* - `None`: 不显示任何内容
*/
declare enum PlayerControlsType {
  Controls = "controls",
  FFT = "fft",
  None = "none"
}
/**
* 在隐藏歌词的情况下专辑图的布局方式：
* - `Auto`: 根据专辑图是否为视频以使用沉浸布局
* - `ForceNormal`: 强制使用默认的专辑图布局
* - `ForceImmersive`: 强制使用沉浸式的专辑图布局
*/
declare enum VerticalCoverLayout {
  Auto = "auto",
  ForceNormal = "force-normal",
  ForceImmersive = "force-immersive"
}
/**
* 可用的歌词渲染器实现
*/
declare enum LyricPlayerImplementation {
  Dom = "dom"
}
/**
* 可用的预设歌词字体大小
*/
declare enum LyricSizePreset {
  Tiny = "tiny",
  ExtraSmall = "extra-small",
  Small = "small",
  Medium = "medium",
  Large = "large",
  ExtraLarge = "extra-large",
  Huge = "huge"
}
type LyricPlayerImplementationObject = {
  lyricPlayer?: {
    new (...args: ConstructorParameters<typeof LyricPlayerBase>): LyricPlayerBase;
  };
};
/**
* 歌词播放组件的实现类型
* @default DomLyricPlayer
*/
declare const lyricPlayerImplementationAtom: PrimitiveAtom<LyricPlayerImplementationObject>;
/**
* 是否启用歌词行模糊效果
*
* 性能影响：较高
* @default true
*/
declare const enableLyricLineBlurEffectAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 是否启用歌词行缩放效果
*
* 性能影响：无
* @default true
*/
declare const enableLyricLineScaleEffectAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 是否使用物理弹簧算法实现歌词动画效果
*
* 如果启用，则会通过弹簧算法实时处理歌词位置，但是需要性能足够强劲的电脑方可流畅运行
*
* 如果不启用，则会回退到基于 transition 的过渡效果，对低性能的机器比较友好，但是效果会比较单一
*
* 性能影响：较高
* @default true
*/
declare const enableLyricLineSpringAnimationAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 是否显示翻译歌词行
*
* 性能影响：无
* @default true
*/
declare const enableLyricTranslationLineAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 是否显示音译歌词行
*
* 性能影响：无
* @default true
*/
declare const enableLyricRomanLineAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 是否交换音译和翻译歌词行的显示位置
*
* 性能影响：无
* @default false
*/
declare const enableLyricSwapTransRomanLineAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 调节逐词歌词时单词的渐变过渡宽度，单位为一个全角字的宽度
* - 如果要模拟 Apple Music for Android 的效果，可以设置为 1
* - 如果要模拟 Apple Music for iPad 的效果，可以设置为 0.5
* - 如需关闭逐词歌词时单词的渐变过渡效果，可以设置为 0
* @default 0.5
*/
declare const lyricWordFadeWidthAtom: WritableAtom<number, [number | ((prev: number) => number) | typeof RESET], void>;
/**
* 设置歌词组件的字体家族
*
* 以逗号分隔的字体名称组合，等同于 CSS 的 font-family 属性
* @default ""
*/
declare const lyricFontFamilyAtom: WritableAtom<string, [string | ((prev: string) => string) | typeof RESET], void>;
/**
* 设置歌词组件的字体字重
*
* 等同于 CSS 的 font-weight 属性
* @default 600
*/
declare const lyricFontWeightAtom: WritableAtom<number | string, [number | string | ((prev: number | string) => number | string) | typeof RESET], void>;
/**
* 设置歌词组件的字符间距
*
* 等同于 CSS 的 letter-spacing 属性
* @default "normal"
*/
declare const lyricLetterSpacingAtom: WritableAtom<string, [string | ((prev: string) => string) | typeof RESET], void>;
/**
* 设置歌词的字体大小
* @default LyricSizePreset.Medium
*/
declare const lyricSizePresetAtom: WritableAtom<LyricSizePreset, [LyricSizePreset | ((prev: LyricSizePreset) => LyricSizePreset) | typeof RESET], void>;
/**
* 播放控制组件的显示类型，即歌曲信息下方的组件
*/
declare const playerControlsTypeAtom: WritableAtom<PlayerControlsType, [PlayerControlsType | ((prev: PlayerControlsType) => PlayerControlsType) | typeof RESET], void>;
/**
* 是否显示歌曲名称
* @default true
*/
declare const showMusicNameAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 在隐藏歌词的情况下专辑图的布局方式
* @default VerticalCoverLayout.Auto
*/
declare const verticalCoverLayoutAtom: WritableAtom<VerticalCoverLayout, [VerticalCoverLayout | ((prev: VerticalCoverLayout) => VerticalCoverLayout) | typeof RESET], void>;
/**
* 是否显示歌曲作者
* @default true
*/
declare const showMusicArtistsAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 是否显示歌曲专辑名称
*
* 如果同时启用三个，布局上可能不太好看，请酌情调节
* @default false
*/
declare const showMusicAlbumAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 是否显示音量控制条
* @default true
*/
declare const showVolumeControlAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 是否显示底部控制按钮组
*
* 在横向布局里是右下角的几个按钮，在竖向布局里是播放按钮下方的几个按钮
* @default true
*/
declare const showBottomControlAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
type LyricBackgroundRenderer = {
  renderer?: BackgroundRenderProps["renderer"] | string;
};
/**
* 配置所使用的歌词背景渲染器
*/
declare const lyricBackgroundRendererAtom: PrimitiveAtom<LyricBackgroundRenderer>;
/**
* 当背景渲染器设置为纯色或CSS背景时，使用此值
* @default "#111111"
*/
declare const cssBackgroundPropertyAtom: WritableAtom<string, [string | ((prev: string) => string) | typeof RESET], void>;
/**
* 调节背景的最大渲染帧率，较低的值可以提升性能
*
* 性能影响：高
* @default 60
*/
declare const lyricBackgroundFPSAtom: WritableAtom<number, [number | ((prev: number) => number) | typeof RESET], void>;
/**
* 调节背景的渲染倍率，较低的值可以提升性能
*
* 性能影响：高
* @default 1
*/
declare const lyricBackgroundRenderScaleAtom: WritableAtom<number, [number | ((prev: number) => number) | typeof RESET], void>;
/**
* 是否启用背景静态模式
*
* 让背景会在除了切换歌曲变换封面的情况下保持静止，如果遇到了性能问题，可以考虑开启此项
*
* 注意：启用此项会导致背景跳动效果失效
* @default false
*/
declare const lyricBackgroundStaticModeAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 控制歌词播放页面是否可见
*/
declare const isLyricPageOpenedAtom: PrimitiveAtom<boolean>;
/**
* 是否隐藏歌词视图（即使有歌词数据）
* @default false
*/
declare const hideLyricViewAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 是否在进度条上显示剩余时间而非当前时间
* @default true
*/
declare const showRemainingTimeAtom: WritableAtom<boolean, [boolean | ((prev: boolean) => boolean) | typeof RESET], void>;
/**
* 音频可视化频域范围
*
* 单位为赫兹（hz），此项会影响音频可视化和背景跳动效果的展示效果
* @default [80, 2000]
*/
declare const fftDataRangeAtom: WritableAtom<[number, number], [[number, number] | ((prev: [number, number]) => [number, number]) | typeof RESET], void>;
//#endregion
//#region src/states/controlsAtoms.d.ts
/**
* 重复播放的模式
*/
declare enum RepeatMode {
  Off = "off",
  One = "one",
  All = "all"
}
/**
* 随机播放是否开启
*/
declare const isShuffleActiveAtom: PrimitiveAtom<boolean>;
/**
* 当前的重复播放模式
*/
declare const repeatModeAtom: PrimitiveAtom<RepeatMode>;
/**
* 随机按钮是否可用
*/
declare const isShuffleEnabledAtom: PrimitiveAtom<boolean>;
/**
* 重复按钮是否可用
*/
declare const isRepeatEnabledAtom: PrimitiveAtom<boolean>;
/**
* 切换随机播放模式的动作
*/
declare const toggleShuffleActionAtom: WritableAtom<null, [], void>;
/**
* 切换循环播放模式的动作
*/
declare const cycleRepeatModeActionAtom: WritableAtom<null, [], void>;
//#endregion
//#region src/states/dataAtoms.d.ts
type SongData = {
  type: "local";
  filePath: string;
  origOrder: number;
} | {
  type: "custom";
  id: string;
  songJsonData: string;
  origOrder: number;
};
/**
* 一位艺术家的信息
*/
interface ArtistStateEntry {
  name: string;
  id: string;
}
/**
* 音频质量的类型枚举
*/
declare enum AudioQualityType {
  None = "none",
  Standard = "standard",
  Lossless = "lossless",
  HiResLossless = "hi-res-lossless",
  DolbyAtmos = "dolby-atmos"
}
/**
* 描述音频质量信息的接口
*/
interface MusicQualityState {
  /**
  * 音频质量
  */
  type: AudioQualityType;
  /**
  * 音频解码器
  */
  codec: string;
  /**
  * 音频通道数量
  */
  channels: number;
  /**
  * 采样率
  */
  sampleRate: number;
  /**
  * 采样格式
  */
  sampleFormat: string;
}
/**
* 当前播放歌曲的 ID
*/
declare const musicIdAtom: PrimitiveAtom<string>;
/**
* 当前播放的音乐名称
*/
declare const musicNameAtom: PrimitiveAtom<string>;
/**
* 当前播放的音乐创作者列表
*/
declare const musicArtistsAtom: PrimitiveAtom<ArtistStateEntry[]>;
/**
* 当前播放的音乐所属专辑名称
*/
declare const musicAlbumNameAtom: PrimitiveAtom<string>;
/**
* 当前播放的音乐专辑封面 URL
*
* 除了图片也可以是视频资源
*/
declare const musicCoverAtom: PrimitiveAtom<string>;
/**
* 当前播放的音乐专辑封面资源是否为视频
*/
declare const musicCoverIsVideoAtom: PrimitiveAtom<boolean>;
/**
* 当前音乐的总时长，单位为毫秒
*/
declare const musicDurationAtom: PrimitiveAtom<number>;
/**
* 当前音乐是否正在播放
*/
declare const musicPlayingAtom: PrimitiveAtom<boolean>;
/**
* 当前音乐的播放进度，单位为毫秒
*/
declare const musicPlayingPositionAtom: PrimitiveAtom<number>;
/**
* 当前播放的音乐音量大小，范围在 [0.0-1.0] 之间
*/
declare const musicVolumeAtom: WritableAtom<number, [number | ((prev: number) => number) | typeof RESET], void>;
/**
* 当前播放的音乐的歌词数据
*/
declare const musicLyricLinesAtom: PrimitiveAtom<LyricLine[]>;
/**
* 当前音乐的音质信息
*/
declare const musicQualityAtom: PrimitiveAtom<MusicQualityState>;
/**
* 根据音质信息生成的、用于UI展示的标签内容
*
* 如果为 null 则不显示标签
*/
declare const musicQualityTagAtom: PrimitiveAtom<{
  tagIcon: boolean;
  tagText: string;
  isDolbyAtmos: boolean;
} | null>;
/**
* 用于音频可视化频谱图的实时频域数据
*/
declare const fftDataAtom: PrimitiveAtom<number[]>;
/**
* 设置低频的音量大小，范围在 80hz-120hz 之间为宜，取值范围在 0.0-1.0 之间。
*
* 部分渲染器会根据音量大小调整背景效果（例如根据鼓点跳动）。如果无法获取到类似的数据，请传入 1.0 作为默认值，或不做任何处理。
*/
declare const lowFreqVolumeAtom: PrimitiveAtom<number>;
//#endregion
//#region src/utils/duration.d.ts
declare function toDuration(duration: number): string;
//#endregion
export { ArtistStateEntry, AudioFFTVisualizer, AudioQualityTag, AudioQualityTagProps, AudioQualityType, AutoLyricLayout, BouncingSlider, Callback, ControlThumb, Cover, CoverProps, HorizontalLayout, LyricBackgroundRenderer, LyricPlayerImplementation, LyricPlayerImplementationObject, LyricSizePreset, MediaButton, MenuButton, MusicInfo, MusicQualityState, PlayerControlsType, PrebuiltLyricPlayer, PrebuiltLyricPlayerProps, PrebuiltToggleIconButton, PrebuiltToggleIconButtonType, RepeatMode, SliderProps, SongData, TextMarquee, ToggleIconButton, VerticalCoverLayout, VerticalLayout, VolumeControl, cssBackgroundPropertyAtom, cycleRepeatModeActionAtom, enableLyricLineBlurEffectAtom, enableLyricLineScaleEffectAtom, enableLyricLineSpringAnimationAtom, enableLyricRomanLineAtom, enableLyricSwapTransRomanLineAtom, enableLyricTranslationLineAtom, fftDataAtom, fftDataRangeAtom, hideLyricViewAtom, isLyricPageOpenedAtom, isRepeatEnabledAtom, isShuffleActiveAtom, isShuffleEnabledAtom, lowFreqVolumeAtom, lyricBackgroundFPSAtom, lyricBackgroundRenderScaleAtom, lyricBackgroundRendererAtom, lyricBackgroundStaticModeAtom, lyricFontFamilyAtom, lyricFontWeightAtom, lyricLetterSpacingAtom, lyricPlayerImplementationAtom, lyricSizePresetAtom, lyricWordFadeWidthAtom, musicAlbumNameAtom, musicArtistsAtom, musicCoverAtom, musicCoverIsVideoAtom, musicDurationAtom, musicIdAtom, musicLyricLinesAtom, musicNameAtom, musicPlayingAtom, musicPlayingPositionAtom, musicQualityAtom, musicQualityTagAtom, musicVolumeAtom, onChangeVolumeAtom, onClickAudioQualityTagAtom, onClickControlThumbAtom, onCycleRepeatModeAtom, onLyricLineClickAtom, onLyricLineContextMenuAtom, onPlayOrResumeAtom, onRequestNextSongAtom, onRequestOpenMenuAtom, onRequestPrevSongAtom, onSeekPositionAtom, onToggleShuffleAtom, playerControlsTypeAtom, repeatModeAtom, showBottomControlAtom, showMusicAlbumAtom, showMusicArtistsAtom, showMusicNameAtom, showRemainingTimeAtom, showVolumeControlAtom, toDuration, toggleShuffleActionAtom, verticalCoverLayoutAtom };
//# sourceMappingURL=amll-react-framework.d.cts.map