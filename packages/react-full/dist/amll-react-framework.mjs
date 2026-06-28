import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { c } from "react/compiler-runtime";
import React, { forwardRef, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import classnames from "classnames";
import { AnimatePresence, LayoutGroup, animate, motion, useAnimationFrame, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Squircle } from "corner-smoothing";
import { BackgroundRender, LyricPlayer, MeshGradientRenderer, PixiRenderer } from "@applemusic-like-lyrics/react";
import structuredClone from "@ungap/structured-clone";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { DomLyricPlayer, MeshGradientRenderer as MeshGradientRenderer$1, PixiRenderer as PixiRenderer$1 } from "@applemusic-like-lyrics/core";
import { atomWithStorage } from "jotai/utils";
//#region src/components/AudioFFTVisualizer/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const AudioFFTVisualizer = (t0) => {
	const $ = c(10);
	let fftData;
	let props;
	if ($[0] !== t0) {
		({fftData, ...props} = t0);
		$[0] = t0;
		$[1] = fftData;
		$[2] = props;
	} else {
		fftData = $[1];
		props = $[2];
	}
	const canvasRef = useRef(null);
	const fftDataRef = useRef(void 0);
	if (fftDataRef.current === void 0) fftDataRef.current = fftData;
	let t1;
	let t2;
	if ($[3] !== fftData) {
		t1 = () => {
			fftDataRef.current = fftData;
		};
		t2 = [fftData];
		$[3] = fftData;
		$[4] = t1;
		$[5] = t2;
	} else {
		t1 = $[4];
		t2 = $[5];
	}
	useEffect(t1, t2);
	let t3;
	let t4;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = () => {
			const canvas = canvasRef.current;
			if (canvas) {
				const ctx = canvas.getContext("2d");
				if (ctx) {
					let targetSize = {
						width: 0,
						height: 0
					};
					const obs = new ResizeObserver((sizes) => {
						for (const size of sizes) targetSize = {
							width: size.contentRect.width * window.devicePixelRatio,
							height: size.contentRect.height * window.devicePixelRatio
						};
					});
					obs.observe(canvas);
					let maxValue = 100;
					let stopped = false;
					let buf = [];
					let cachedResampleArray = new Float32Array(0);
					const resampleLinear = function resampleLinear(src, dstLen) {
						if (!(typeof navigator !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent))) {
							const n = src.length;
							if (dstLen <= 0 || n === 0) return [];
							if (n === dstLen) return src.slice();
							const out = new Array(dstLen);
							const scale = (n - 1) / Math.max(1, dstLen - 1);
							for (let i = 0; i < dstLen; i++) {
								const x = i * scale;
								const x0 = Math.floor(x);
								const x1 = Math.min(n - 1, x0 + 1);
								const t = x - x0;
								out[i] = src[x0] * (1 - t) + src[x1] * t;
							}
							return out;
						}
						const n_0 = src.length;
						if (dstLen <= 0 || n_0 === 0) return [];
						if (cachedResampleArray.length !== dstLen) cachedResampleArray = new Float32Array(dstLen);
						const scale_0 = (n_0 - 1) / Math.max(1, dstLen - 1);
						for (let i_0 = 0; i_0 < dstLen; i_0++) {
							const x_0 = i_0 * scale_0;
							const x0_0 = Math.floor(x_0);
							const x1_0 = Math.min(n_0 - 1, x0_0 + 1);
							const t_0 = x_0 - x0_0;
							cachedResampleArray[i_0] = src[x0_0] * (1 - t_0) + src[x1_0] * t_0;
						}
						return cachedResampleArray;
					};
					function onFrame() {
						if (!(canvas && ctx) || stopped) return;
						const width = canvas.width;
						const height = canvas.height;
						if (targetSize.width !== width || targetSize.height !== height) {
							canvas.width = targetSize.width;
							canvas.height = targetSize.height;
						}
						const processed = fftDataRef.current ?? [];
						if (buf.length !== processed.length) buf = [...processed];
						else for (let i_1 = 0; i_1 < buf.length; i_1++) {
							let t_1 = processed[i_1];
							t_1 = t_1 * Math.min((i_1 + 5) / buf.length * 4, 1);
							buf[i_1] = buf[i_1] + t_1 * 2;
							buf[i_1] = buf[i_1] / 3;
						}
						ctx.clearRect(0, 0, width, height);
						ctx.beginPath();
						const dpr = window.devicePixelRatio || 1;
						const desiredSpacing = 8 * dpr;
						let desiredCount = Math.floor(width / Math.max(1, desiredSpacing));
						desiredCount = Math.max(8, desiredCount);
						const lineCount = buf.length > 0 ? Math.min(buf.length, desiredCount) : 0;
						const display = lineCount > 0 ? resampleLinear(buf, lineCount) : [];
						const targetMaxValue = display.length > 0 ? Math.max.apply(Math, display) : 0;
						maxValue = Math.max(targetMaxValue * .1 + maxValue * .9, 100);
						const barWidth = width / Math.max(1, display.length);
						ctx.strokeStyle = "white";
						ctx.lineWidth = 4 * dpr;
						ctx.lineCap = "round";
						ctx.lineJoin = "round";
						const barBeginY = height - barWidth;
						for (let i_2 = 0; i_2 < display.length; i_2++) {
							const x_1 = barWidth * (i_2 + .5);
							ctx.moveTo(x_1, barBeginY);
							const norm = Math.min(1, Math.max(0, display[i_2] / maxValue));
							ctx.lineTo(x_1, barBeginY - norm ** 2 * (height - barWidth * 2));
						}
						ctx.stroke();
						requestAnimationFrame(onFrame);
					}
					onFrame();
					return () => {
						obs.disconnect();
						stopped = true;
					};
				}
			}
		};
		t4 = [];
		$[6] = t3;
		$[7] = t4;
	} else {
		t3 = $[6];
		t4 = $[7];
	}
	useLayoutEffect(t3, t4);
	let t5;
	if ($[8] !== props) {
		t5 = /* @__PURE__ */ jsx("canvas", {
			ref: canvasRef,
			...props
		});
		$[8] = props;
		$[9] = t5;
	} else t5 = $[9];
	return t5;
};
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/AudioQualityTag/icon_dolby_atmos.svg
const SvgIconDolbyAtmos = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 192,
	height: 36,
	viewBox: "0 0 192 36",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M139.11 15.884H135.582V23.8C135.582 24.6027 135.732 25.1814 136.03 25.536C136.329 25.872 136.805 26.04 137.458 26.04C137.701 26.04 137.962 26.012 138.242 25.956C138.522 25.9 138.774 25.816 138.998 25.704L139.082 27.86C138.765 27.972 138.41 28.056 138.018 28.112C137.645 28.1867 137.253 28.224 136.842 28.224C135.592 28.224 134.63 27.8787 133.958 27.188C133.305 26.4974 132.978 25.4614 132.978 24.08V15.884H130.43V13.728H132.978V7.92004H135.582V13.728H139.11V15.884ZM117.188 20.692H124.608L120.912 11.396L117.188 20.692ZM114.22 28H111.14L119.736 8.17604H122.256L130.768 28H127.632L125.616 23.128H116.208L114.22 28ZM145.441 15.12C144.713 15.6054 144.181 16.2027 143.845 16.912H143.761C143.761 16.632 143.752 16.2867 143.733 15.876C143.715 15.4467 143.687 15.064 143.649 14.728H141.157C141.195 15.1574 141.223 15.652 141.241 16.212C141.26 16.772 141.269 17.2294 141.269 17.584V28H143.901V20.944C143.901 19.6187 144.219 18.564 144.853 17.78C145.507 16.9774 146.319 16.576 147.289 16.576C147.812 16.576 148.251 16.6694 148.605 16.856C148.96 17.024 149.249 17.2667 149.473 17.584C149.697 17.8827 149.856 18.2467 149.949 18.676C150.043 19.1054 150.089 19.5814 150.089 20.104V28H152.721V20.832C152.721 20.3094 152.777 19.796 152.889 19.292C153.02 18.788 153.216 18.34 153.477 17.948C153.757 17.5374 154.112 17.2107 154.541 16.968C154.971 16.7067 155.484 16.576 156.081 16.576C156.66 16.576 157.136 16.688 157.509 16.912C157.883 17.136 158.181 17.4347 158.405 17.808C158.629 18.1814 158.788 18.6107 158.881 19.096C158.975 19.5814 159.021 20.0947 159.021 20.636V28H161.653V19.768C161.653 19.0214 161.551 18.3214 161.345 17.668C161.159 17.0147 160.86 16.4454 160.449 15.96C160.039 15.4747 159.525 15.092 158.909 14.812C158.293 14.5134 157.556 14.364 156.697 14.364C155.745 14.364 154.868 14.5974 154.065 15.064C153.263 15.512 152.637 16.1654 152.189 17.024C151.779 16.072 151.209 15.3907 150.481 14.98C149.772 14.5694 148.969 14.364 148.073 14.364C147.065 14.364 146.188 14.616 145.441 15.12ZM176.233 21.336C176.233 20.7014 176.131 20.0947 175.925 19.516C175.739 18.9374 175.459 18.4334 175.085 18.004C174.712 17.556 174.245 17.2014 173.685 16.94C173.144 16.6787 172.519 16.548 171.809 16.548C171.1 16.548 170.465 16.6787 169.905 16.94C169.364 17.2014 168.907 17.556 168.533 18.004C168.16 18.4334 167.871 18.9374 167.665 19.516C167.479 20.0947 167.385 20.7014 167.385 21.336C167.385 21.9707 167.479 22.5774 167.665 23.156C167.871 23.7347 168.16 24.248 168.533 24.696C168.907 25.144 169.364 25.4987 169.905 25.76C170.465 26.0214 171.1 26.152 171.809 26.152C172.519 26.152 173.144 26.0214 173.685 25.76C174.245 25.4987 174.712 25.144 175.085 24.696C175.459 24.248 175.739 23.7347 175.925 23.156C176.131 22.5774 176.233 21.9707 176.233 21.336ZM178.977 21.336C178.977 22.3627 178.791 23.3054 178.417 24.164C178.063 25.0227 177.559 25.7694 176.905 26.404C176.271 27.02 175.515 27.5054 174.637 27.86C173.76 28.196 172.817 28.364 171.809 28.364C170.801 28.364 169.859 28.196 168.981 27.86C168.104 27.5054 167.348 27.02 166.713 26.404C166.079 25.7694 165.575 25.0227 165.201 24.164C164.847 23.3054 164.669 22.3627 164.669 21.336C164.669 20.3094 164.847 19.376 165.201 18.536C165.575 17.6774 166.079 16.94 166.713 16.324C167.348 15.708 168.104 15.232 168.981 14.896C169.859 14.5414 170.801 14.364 171.809 14.364C172.817 14.364 173.76 14.5414 174.637 14.896C175.515 15.232 176.271 15.708 176.905 16.324C177.559 16.94 178.063 17.6774 178.417 18.536C178.791 19.376 178.977 20.3094 178.977 21.336ZM187.975 16.912C188.517 17.2107 188.937 17.6027 189.235 18.088L191.055 16.548C190.57 15.8387 189.879 15.2974 188.983 14.924C188.106 14.5507 187.191 14.364 186.239 14.364C185.605 14.364 184.989 14.448 184.391 14.616C183.794 14.7654 183.262 15.008 182.795 15.344C182.329 15.6614 181.946 16.0814 181.647 16.604C181.367 17.108 181.227 17.7147 181.227 18.424C181.227 19.04 181.339 19.5627 181.563 19.992C181.806 20.4027 182.114 20.748 182.487 21.028C182.861 21.308 183.271 21.532 183.719 21.7C184.186 21.8494 184.643 21.98 185.091 22.092C186.23 22.3534 187.089 22.6334 187.667 22.932C188.265 23.2307 188.563 23.688 188.563 24.304C188.563 24.6774 188.489 24.9854 188.339 25.228C188.19 25.4707 187.985 25.6667 187.723 25.816C187.481 25.9654 187.201 26.0774 186.883 26.152C186.585 26.208 186.267 26.236 185.931 26.236C185.185 26.236 184.494 26.0587 183.859 25.704C183.243 25.3494 182.758 24.9107 182.403 24.388L180.527 25.984C181.162 26.7867 181.955 27.384 182.907 27.776C183.878 28.168 184.867 28.364 185.875 28.364C186.547 28.364 187.201 28.2894 187.835 28.14C188.47 27.9907 189.03 27.748 189.515 27.412C190.019 27.0574 190.421 26.6094 190.719 26.068C191.018 25.5267 191.167 24.864 191.167 24.08C191.167 23.5014 191.055 22.9974 190.831 22.568C190.607 22.1387 190.29 21.7747 189.879 21.476C189.487 21.1587 189.021 20.8974 188.479 20.692C187.938 20.4867 187.35 20.3094 186.715 20.16C185.707 19.936 184.951 19.6934 184.447 19.432C183.943 19.152 183.691 18.732 183.691 18.172C183.691 17.8547 183.757 17.5934 183.887 17.388C184.037 17.164 184.223 16.9867 184.447 16.856C184.69 16.7067 184.961 16.604 185.259 16.548C185.558 16.4734 185.857 16.436 186.155 16.436C186.827 16.436 187.434 16.5947 187.975 16.912ZM2.95973 27.9533H0V7.93701H2.95973C8.48624 7.93701 12.9927 12.4323 12.9927 17.9451C12.9927 23.4579 8.48624 27.9533 2.95973 27.9533ZM25.5841 7.93701H28.5439V27.9533H25.5841C20.0576 27.9533 15.5511 23.4579 15.5511 17.9451C15.5511 12.4323 20.0576 7.93701 25.5841 7.93701ZM34.6222 7.93701H41.8682C47.4003 7.93701 51.9012 12.4268 51.9012 17.9451C51.9012 23.4635 47.4003 27.9533 41.8682 27.9533H34.6222V7.93701ZM37.6627 24.9175H41.8682C45.717 24.9175 48.8579 21.7871 48.8579 17.9424C48.8579 14.1031 45.7198 10.97 41.8682 10.97H37.6627V24.9175ZM53.4424 21.0365C53.4424 17.2112 56.561 14.1003 60.3958 14.1003C64.2307 14.1003 67.3492 17.2112 67.3492 21.0365C67.3492 24.8619 64.2307 27.9727 60.3958 27.9727C56.561 27.9727 53.4424 24.8619 53.4424 21.0365ZM56.2043 21.0115C56.2043 23.305 58.0687 25.1927 60.3958 25.1927C62.6978 25.1927 64.5874 23.3301 64.5874 21.0115C64.5874 18.718 62.695 16.8303 60.3958 16.8303C58.0966 16.8303 56.2043 18.6902 56.2043 21.0115ZM73.3574 27.9755H70.3168V7.93979H73.3574V27.9755ZM79.9647 15.3514C81.0906 14.5646 82.4618 14.1003 83.9389 14.1003C87.7709 14.1003 90.8895 17.2112 90.8923 21.0365C90.8923 24.8619 87.7737 27.9727 83.9389 27.9727C82.4618 27.9727 81.0934 27.5084 79.9647 26.7217V27.9755H76.9158V7.93979H79.9647V15.3514ZM79.9647 22.3292C80.5165 23.9861 82.08 25.1927 83.9389 25.1927C86.2381 25.1927 88.1304 23.3328 88.1304 21.0115C88.1304 18.718 86.2381 16.8303 83.9389 16.8303C82.0995 16.8303 80.5221 18.023 79.9647 19.691C79.8254 20.1052 79.7473 20.55 79.7473 21.0115C79.7473 21.473 79.8254 21.915 79.9647 22.3292ZM99.0715 22.9937L103.035 14.1059H106.357C105.983 14.9363 103.631 20.1804 101.593 24.7238C99.933 28.4242 98.4816 31.6599 98.4778 31.6674C97.5944 33.6468 95.2589 34.5419 93.283 33.6607L92.2295 33.1908L92.224 33.1881L93.453 30.4386L93.8905 30.6332C94.7043 30.9974 95.6658 30.6276 96.0309 29.8131C96.0337 29.8048 97.4104 26.7161 97.4104 26.7161L91.7864 14.1059H95.1084L99.0715 22.9937Z",
		fill: "currentColor"
	})
});
const ForwardRef$24 = forwardRef(SvgIconDolbyAtmos);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/AudioQualityTag/icon_loseless.svg
const SvgIconLoseless = (props, ref) => /* @__PURE__ */ jsxs("svg", {
	width: 30,
	height: 20,
	viewBox: "0 0 30 20",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: [/* @__PURE__ */ jsx("g", {
		clipPath: "url(#clip0_207_8)",
		children: /* @__PURE__ */ jsx("path", {
			d: "M16.0117 1.81812C18.4258 1.81812 19.8776 4.78099 20.958 7.92092L21.0631 8.23024L21.1659 8.54011L21.2666 8.84995C21.5987 9.88202 21.8972 10.9037 22.1828 11.8167C22.839 8.96008 22.4949 8.34671 23.1979 8.34671C23.4594 8.34671 23.724 8.53256 23.724 8.87123C23.724 9.0083 23.5105 10.461 23.2136 11.9166L23.1588 12.1809L23.1023 12.4436C23.0068 12.8791 22.9051 13.3002 22.8009 13.6704C25.8224 21.9469 28.0659 11.0453 28.3194 8.81691C28.3564 8.49556 28.5879 8.34672 28.8219 8.34672C29.1344 8.34672 29.3907 8.59283 29.3418 8.96318C28.8009 12.5671 27.9689 18.1818 24.5482 18.1818C22.6604 18.1818 21.5992 16.6374 20.7611 14.8678C20.179 13.6722 19.6841 12.2511 19.2288 10.8221L19.1203 10.4791C19.0844 10.3648 19.0487 10.2505 19.0132 10.1364L18.9073 9.79479C17.8713 6.44275 16.9926 3.33702 15.6457 3.33702C14.9875 3.33702 14.4995 4.05555 14.4657 4.05555C14.4036 4.05555 14.3548 3.76279 13.7401 2.96069C14.3251 2.26231 15.1314 1.81812 16.0117 1.81812ZM4.80934 1.82692C10.1957 1.82692 10.6747 16.6849 13.7232 16.6849C14.0811 16.6849 14.4669 16.4581 14.8886 15.9443C15.122 16.3577 15.3613 16.7247 15.6089 17.0478C15.0004 17.774 14.2433 18.1812 13.2952 18.1812C9.88906 18.1807 8.42559 12.2177 7.16605 8.19178C6.86941 9.48319 6.71544 10.6519 6.65516 11.1766C6.61775 11.5101 6.38397 11.662 6.14846 11.662C5.88728 11.662 5.62398 11.4752 5.62398 11.1416C5.62398 11.1167 5.62545 11.091 5.62848 11.0646C5.80292 9.74118 6.15443 7.73614 6.54802 6.3382C6.02411 4.90309 5.36971 3.33458 4.40561 3.33458C2.45924 3.33458 1.34461 8.44844 1.03117 11.1766C0.993764 11.5101 0.759979 11.662 0.524468 11.662C0.263303 11.662 0 11.4752 0 11.1416C0 11.1167 0.00146422 11.091 0.00449843 11.0646C0.0496669 10.7219 0.0980906 10.373 0.15073 10.0213L0.196904 9.71916C0.204779 9.66871 0.212746 9.61823 0.220807 9.56772L0.27033 9.26437C0.887195 5.57133 2.03712 1.82692 4.80934 1.82692ZM10.3981 1.81878C11.3654 1.81878 12.4031 2.34503 13.2976 3.57969C13.3476 3.63964 13.849 4.45427 14.0072 4.73669C14.554 5.77231 15.0302 7.038 15.4694 8.354L15.5832 8.69833C16.8447 12.5534 17.8174 16.7028 19.3326 16.7028C19.6918 16.7028 20.0814 16.4697 20.5126 15.9442C20.746 16.3575 20.9852 16.7245 21.2329 17.0476C20.6259 17.7724 19.8691 18.1812 18.9192 18.1812C13.565 18.1804 12.983 3.3313 10.0333 3.3313C9.36758 3.3313 8.87559 4.05559 8.84162 4.05559C8.7795 4.05559 8.7307 3.76287 8.11611 2.96083C8.7168 2.24348 9.52906 1.81878 10.3981 1.81878Z",
			fill: "currentColor"
		})
	}), /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", {
		id: "clip0_207_8",
		children: /* @__PURE__ */ jsx("rect", {
			width: 30,
			height: 20,
			fill: "currentColor"
		})
	}) })]
});
const ForwardRef$23 = forwardRef(SvgIconLoseless);
//#endregion
//#region src/components/AudioQualityTag/index.module.css
var index_module_default$10 = {
	"audioQualityTag": "_0VB3dq_audioQualityTag",
	"clickable": "_0VB3dq_clickable",
	"commonTag": "_0VB3dq_commonTag",
	"commonTagText": "_0VB3dq_commonTagText",
	"dolby-glow": "_0VB3dq_dolby-glow",
	"dolbyLogoGlow": "_0VB3dq_dolbyLogoGlow"
};
//#endregion
//#region src/components/AudioQualityTag/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const COMMON_VARIENTS = {
	hide: {
		opacity: 0,
		scale: .8,
		transition: {
			duration: .25,
			ease: "circIn"
		}
	},
	show: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 1,
			ease: [
				0,
				.71,
				.2,
				1.01
			]
		}
	},
	hover: { scale: .95 },
	active: { scale: .9 }
};
const DOLBY_VARIENTS = {
	hide: {
		opacity: 0,
		scale: .8,
		transition: {
			duration: .25,
			ease: "circIn"
		}
	},
	show: {
		opacity: [0, 1],
		scale: 1,
		transition: {
			duration: 1,
			ease: [
				0,
				.71,
				.2,
				1.01
			]
		}
	},
	hover: { scale: .95 },
	active: { scale: .9 }
};
const AudioQualityTag = memo(forwardRef((t0, ref) => {
	const $ = c(21);
	let className;
	let isDolbyAtmos;
	let onClick;
	let rest;
	let tagIcon;
	let tagText;
	if ($[0] !== t0) {
		({tagText, tagIcon, isDolbyAtmos, className, onClick, ...rest} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = isDolbyAtmos;
		$[3] = onClick;
		$[4] = rest;
		$[5] = tagIcon;
		$[6] = tagText;
	} else {
		className = $[1];
		isDolbyAtmos = $[2];
		onClick = $[3];
		rest = $[4];
		tagIcon = $[5];
		tagText = $[6];
	}
	const t1 = onClick && index_module_default$10.clickable;
	let t2;
	if ($[7] !== className || $[8] !== t1) {
		t2 = classnames(className, index_module_default$10.audioQualityTag, t1);
		$[7] = className;
		$[8] = t1;
		$[9] = t2;
	} else t2 = $[9];
	let t3;
	if ($[10] !== isDolbyAtmos || $[11] !== onClick || $[12] !== tagIcon || $[13] !== tagText) {
		t3 = isDolbyAtmos ? /* @__PURE__ */ jsxs(motion.div, {
			initial: "hide",
			animate: "show",
			whileHover: onClick ? "hover" : void 0,
			whileTap: onClick ? "active" : void 0,
			exit: "hide",
			className: index_module_default$10.dolbyLogo,
			variants: DOLBY_VARIENTS,
			children: [/* @__PURE__ */ jsx(ForwardRef$24, { className: index_module_default$10.dolbyLogoGlow }), /* @__PURE__ */ jsx(ForwardRef$24, {})]
		}, "dolby-atmos") : /* @__PURE__ */ jsx(motion.div, {
			initial: "hide",
			animate: "show",
			whileHover: onClick ? "hover" : void 0,
			whileTap: onClick ? "active" : void 0,
			exit: "hide",
			variants: COMMON_VARIENTS,
			children: /* @__PURE__ */ jsxs("div", {
				className: index_module_default$10.commonTag,
				children: [tagIcon && /* @__PURE__ */ jsx(ForwardRef$23, { height: "11px" }), tagText && /* @__PURE__ */ jsx("div", {
					className: index_module_default$10.commonTagText,
					children: tagText
				})]
			})
		}, `common-tag-${tagIcon}-${tagText}`);
		$[10] = isDolbyAtmos;
		$[11] = onClick;
		$[12] = tagIcon;
		$[13] = tagText;
		$[14] = t3;
	} else t3 = $[14];
	let t4;
	if ($[15] !== onClick || $[16] !== ref || $[17] !== rest || $[18] !== t2 || $[19] !== t3) {
		t4 = /* @__PURE__ */ jsx("div", {
			className: t2,
			onClick,
			ref,
			...rest,
			children: t3
		});
		$[15] = onClick;
		$[16] = ref;
		$[17] = rest;
		$[18] = t2;
		$[19] = t3;
		$[20] = t4;
	} else t4 = $[20];
	return t4;
}));
//#endregion
//#region src/components/BouncingSlider/index.module.css
var index_module_default$9 = {
	"inner": "zib3QW_inner",
	"nowPlayingSlider": "zib3QW_nowPlayingSlider",
	"thumb": "zib3QW_thumb"
};
//#endregion
//#region src/components/BouncingSlider/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const INITIAL_INSET = 12 / 2;
const MAX_BOUNCE_DISTANCE = 12;
const BouncingSlider = ({ className, style, value, min, max, isPlaying = false, onChange, onAfterChange, onBeforeChange, onSeeking, beforeIcon, afterIcon, changeOnDrag = false }) => {
	const containerRef = useRef(null);
	const innerRef = useRef(null);
	const rectRef = useRef(null);
	const isHoveringRef = useRef(false);
	const progressMv = useMotionValue(0);
	const scaleX = useTransform(progressMv, [0, 1], [0, 1]);
	const insetMv = useMotionValue(INITIAL_INSET);
	const clipPath = useMotionTemplate`inset(${insetMv}px 0px round 100px)`;
	const bounceXSpring = useSpring(0, {
		damping: 12,
		stiffness: 300
	});
	const isDraggingRef = useRef(false);
	const localTimeRef = useRef(value);
	useEffect(() => {
		if (isDraggingRef.current) return;
		localTimeRef.current = value;
		const newProgress = Math.max(0, Math.min(1, (value - min) / (max - min)));
		progressMv.set(newProgress);
	}, [
		value,
		min,
		max,
		progressMv
	]);
	useAnimationFrame((_time, delta) => {
		if (isPlaying && !isDraggingRef.current) {
			localTimeRef.current += delta;
			if (localTimeRef.current > max) localTimeRef.current = max;
			const newProgress_0 = Math.max(0, Math.min(1, (localTimeRef.current - min) / (max - min)));
			progressMv.set(newProgress_0);
		}
	});
	const expand = () => {
		animate(insetMv, 0, {
			type: "tween",
			ease: "easeOut",
			duration: .28
		});
	};
	const collapse = () => {
		animate(insetMv, INITIAL_INSET, {
			type: "spring",
			damping: 12,
			stiffness: 200
		});
	};
	const handlePanStart = (_event) => {
		isDraggingRef.current = true;
		if (innerRef.current) rectRef.current = innerRef.current.getBoundingClientRect();
		expand();
		onBeforeChange?.();
		onSeeking?.(true);
	};
	const handlePan = (_event_0, info) => {
		const rect = rectRef.current;
		if (!rect) return;
		const relPos = (info.point.x - rect.left) / rect.width;
		if (relPos < 0) bounceXSpring.set(Math.tanh(relPos * 2) * MAX_BOUNCE_DISTANCE);
		else if (relPos > 1) bounceXSpring.set(Math.tanh((relPos - 1) * 2) * MAX_BOUNCE_DISTANCE);
		else bounceXSpring.set(0);
		const clampedPos = Math.max(0, Math.min(1, relPos));
		const NewValue = min + clampedPos * (max - min);
		localTimeRef.current = NewValue;
		progressMv.set(clampedPos);
		if (changeOnDrag) onChange?.(NewValue);
	};
	const handlePanEnd = () => {
		isDraggingRef.current = false;
		rectRef.current = null;
		if (isHoveringRef.current) expand();
		else collapse();
		bounceXSpring.set(0);
		onSeeking?.(false);
		onChange?.(localTimeRef.current);
		onAfterChange?.(localTimeRef.current);
	};
	const handleHoverStart = () => {
		isHoveringRef.current = true;
		if (!isDraggingRef.current) expand();
	};
	const handleHoverEnd = () => {
		isHoveringRef.current = false;
		if (!isDraggingRef.current) collapse();
	};
	const handleTap = (_event_1, info_0) => {
		const rect_0 = innerRef.current?.getBoundingClientRect();
		if (!rect_0) return;
		const relPos_0 = Math.max(0, Math.min(1, (info_0.point.x - rect_0.left) / rect_0.width));
		const NewValue_0 = min + relPos_0 * (max - min);
		localTimeRef.current = NewValue_0;
		progressMv.set(relPos_0);
		onBeforeChange?.();
		onChange?.(NewValue_0);
		onAfterChange?.(NewValue_0);
	};
	return /* @__PURE__ */ jsxs(motion.div, {
		ref: containerRef,
		className: classnames(index_module_default$9.nowPlayingSlider, className),
		style: {
			...style,
			x: bounceXSpring
		},
		onPanStart: handlePanStart,
		onPan: handlePan,
		onPanEnd: handlePanEnd,
		onTap: handleTap,
		onHoverStart: handleHoverStart,
		onHoverEnd: handleHoverEnd,
		children: [
			beforeIcon,
			/* @__PURE__ */ jsx(motion.div, {
				ref: innerRef,
				className: index_module_default$9.inner,
				style: { clipPath },
				children: /* @__PURE__ */ jsx(motion.div, {
					className: index_module_default$9.thumb,
					style: {
						scaleX,
						originX: 0
					}
				})
			}),
			afterIcon
		]
	});
};
//#endregion
//#region src/components/ControlThumb/index.module.css
var index_module_default$8 = { "controlThumb": "ib5rOa_controlThumb" };
//#endregion
//#region src/components/ControlThumb/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const ControlThumb = (t0) => {
	const $ = c(25);
	let className;
	let onClick;
	let rest;
	if ($[0] !== t0) {
		({onClick, className, ...rest} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = onClick;
		$[3] = rest;
	} else {
		className = $[1];
		onClick = $[2];
		rest = $[3];
	}
	const containerRef = useRef(null);
	const hoveringRef = useRef(false);
	let t1;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = {
			x: -25,
			y: -4
		};
		$[4] = t1;
	} else t1 = $[4];
	const [thumbOffset, setThumbOffset] = useState(t1);
	let t2;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = (e) => {
			const container = containerRef.current;
			if (container && hoveringRef.current) {
				const rect = container.getBoundingClientRect();
				const left = (e.clientX - rect.left) / 2;
				const top = (e.clientY - rect.top) / 2;
				if (Math.abs(left) > 25 || Math.abs(top) > 25) setThumbOffset({
					x: -25,
					y: -4
				});
				else setThumbOffset({
					x: left - 12.5,
					y: top - 12.5
				});
			}
		};
		$[5] = t2;
	} else t2 = $[5];
	const onMouseMove = t2;
	let t3;
	if ($[6] !== className) {
		t3 = classnames(index_module_default$8.controlThumb, className);
		$[6] = className;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = {
			rest: {
				width: 50,
				height: 8
			},
			hover: {
				width: 25,
				height: 25
			}
		};
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== thumbOffset) {
		t5 = { ...thumbOffset };
		$[9] = thumbOffset;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = { scale: .9 };
		$[11] = t6;
	} else t6 = $[11];
	let t10;
	let t7;
	let t8;
	let t9;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = {
			type: "spring",
			duration: .5
		};
		t8 = (evt) => {
			onMouseMove(evt.nativeEvent);
		};
		t9 = (evt_0) => {
			onMouseMove(evt_0);
			hoveringRef.current = true;
		};
		t10 = () => {
			hoveringRef.current = false;
			setThumbOffset({
				x: -25,
				y: -4
			});
		};
		$[12] = t10;
		$[13] = t7;
		$[14] = t8;
		$[15] = t9;
	} else {
		t10 = $[12];
		t7 = $[13];
		t8 = $[14];
		t9 = $[15];
	}
	let t11;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ jsx(motion.div, {
			variants: {
				rest: {
					height: 0,
					width: 0,
					marginTop: 0,
					marginLeft: 25,
					rotate: 0
				},
				hover: {
					height: 2,
					width: 15,
					marginTop: -1,
					marginLeft: 5,
					rotate: 45
				}
			},
			transition: {
				type: "spring",
				duration: .5
			}
		});
		$[16] = t11;
	} else t11 = $[16];
	let t12;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = /* @__PURE__ */ jsx(motion.div, {
			variants: {
				rest: {
					height: 0,
					width: 0,
					marginTop: 0,
					marginLeft: 25,
					rotate: 0
				},
				hover: {
					height: 2,
					width: 15,
					marginTop: -1,
					marginLeft: 5,
					rotate: -45
				}
			},
			transition: {
				type: "spring",
				duration: .5
			}
		});
		$[17] = t12;
	} else t12 = $[17];
	let t13;
	if ($[18] !== onClick || $[19] !== t5) {
		t13 = /* @__PURE__ */ jsxs(motion.button, {
			type: "button",
			variants: t4,
			animate: t5,
			whileTap: t6,
			whileHover: "hover",
			initial: "rest",
			transition: t7,
			onMouseMove: t8,
			onHoverStart: t9,
			onHoverEnd: t10,
			onClick,
			children: [t11, t12]
		});
		$[18] = onClick;
		$[19] = t5;
		$[20] = t13;
	} else t13 = $[20];
	let t14;
	if ($[21] !== rest || $[22] !== t13 || $[23] !== t3) {
		t14 = /* @__PURE__ */ jsx("div", {
			className: t3,
			ref: containerRef,
			...rest,
			children: t13
		});
		$[21] = rest;
		$[22] = t13;
		$[23] = t3;
		$[24] = t14;
	} else t14 = $[24];
	return t14;
};
//#endregion
//#region src/components/Cover/index.module.css
var index_module_default$7 = {
	"cover": "Z2g6da_cover",
	"coverInner": "Z2g6da_coverInner",
	"musicPaused": "Z2g6da_musicPaused"
};
//#endregion
//#region src/components/Cover/index.tsx
/**
* @fileoverview
* 一个专辑图组件
*/
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
/**
* 一个专辑图组件
*/
const Cover = forwardRef((t0, ref) => {
	const $ = c(33);
	let className;
	let coverIsVideo;
	let coverUrl;
	let coverVideoPaused;
	let musicPaused;
	let pauseShrinkAspect;
	let rest;
	if ($[0] !== t0) {
		({coverUrl, coverIsVideo, coverVideoPaused, className, musicPaused, pauseShrinkAspect, ...rest} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = coverIsVideo;
		$[3] = coverUrl;
		$[4] = coverVideoPaused;
		$[5] = musicPaused;
		$[6] = pauseShrinkAspect;
		$[7] = rest;
	} else {
		className = $[1];
		coverIsVideo = $[2];
		coverUrl = $[3];
		coverVideoPaused = $[4];
		musicPaused = $[5];
		pauseShrinkAspect = $[6];
		rest = $[7];
	}
	const frameRef = useRef(null);
	const t1 = musicPaused && index_module_default$7.musicPaused;
	let t2;
	if ($[8] !== className || $[9] !== t1) {
		t2 = classnames(index_module_default$7.cover, t1, className);
		$[8] = className;
		$[9] = t1;
		$[10] = t2;
	} else t2 = $[10];
	const clsNames = t2;
	const videoRef = useRef(null);
	let t3;
	let t4;
	if ($[11] !== coverVideoPaused) {
		t3 = () => {
			const videoEl = videoRef.current;
			if (videoEl) if (coverVideoPaused) videoEl.pause();
			else videoEl.play();
		};
		t4 = [coverVideoPaused];
		$[11] = coverVideoPaused;
		$[12] = t3;
		$[13] = t4;
	} else {
		t3 = $[12];
		t4 = $[13];
	}
	useEffect(t3, t4);
	const [cornerRadius, setCornerRadius] = useState(20);
	let t5;
	let t6;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = () => {
			const frameEl = frameRef.current;
			if (frameEl) {
				const onResize = () => {
					const size = Math.min(frameEl.clientWidth, frameEl.clientHeight);
					setCornerRadius(Math.max(size * .02, window.innerHeight * .007));
				};
				const obz = new ResizeObserver(onResize);
				onResize();
				obz.observe(frameEl);
				return () => {
					obz.disconnect();
				};
			}
		};
		t6 = [];
		$[14] = t5;
		$[15] = t6;
	} else {
		t5 = $[14];
		t6 = $[15];
	}
	useLayoutEffect(t5, t6);
	const t7 = pauseShrinkAspect ?? .75;
	let t8;
	if ($[16] !== t7) {
		t8 = { "--scale-level": t7 };
		$[16] = t7;
		$[17] = t8;
	} else t8 = $[17];
	const t9 = t8;
	let t10;
	if ($[18] !== ref) {
		t10 = (node) => {
			frameRef.current = node;
			if (typeof ref === "function") ref(node);
			else if (ref) ref.current = node;
		};
		$[18] = ref;
		$[19] = t10;
	} else t10 = $[19];
	let t11;
	if ($[20] !== coverIsVideo || $[21] !== coverUrl || $[22] !== pauseShrinkAspect) {
		t11 = coverIsVideo ? /* @__PURE__ */ jsx("video", {
			className: index_module_default$7.coverInner,
			src: coverUrl,
			autoPlay: true,
			loop: true,
			muted: true,
			playsInline: true,
			crossOrigin: "anonymous",
			ref: videoRef
		}) : /* @__PURE__ */ jsx("div", {
			className: index_module_default$7.coverInner,
			style: {
				backgroundImage: `url(${coverUrl})`,
				"--scale-level": pauseShrinkAspect ?? .75
			}
		});
		$[20] = coverIsVideo;
		$[21] = coverUrl;
		$[22] = pauseShrinkAspect;
		$[23] = t11;
	} else t11 = $[23];
	let t12;
	if ($[24] !== cornerRadius || $[25] !== t11) {
		t12 = /* @__PURE__ */ jsx(Squircle, {
			cornerRadius,
			cornerSmoothing: .7,
			className: index_module_default$7.coverInner,
			children: t11
		});
		$[24] = cornerRadius;
		$[25] = t11;
		$[26] = t12;
	} else t12 = $[26];
	let t13;
	if ($[27] !== clsNames || $[28] !== rest || $[29] !== t10 || $[30] !== t12 || $[31] !== t9) {
		t13 = /* @__PURE__ */ jsx("div", {
			className: clsNames,
			style: t9,
			ref: t10,
			...rest,
			children: t12
		});
		$[27] = clsNames;
		$[28] = rest;
		$[29] = t10;
		$[30] = t12;
		$[31] = t9;
		$[32] = t13;
	} else t13 = $[32];
	return t13;
});
//#endregion
//#region src/components/MediaButton/index.module.css
var index_module_default$6 = {
	"animate": "LbO0zG_animate",
	"mediaButton": "LbO0zG_mediaButton",
	"pressed-animation": "LbO0zG_pressed-animation"
};
//#endregion
//#region src/components/MediaButton/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const MediaButton = memo((t0) => {
	const $ = c(21);
	let children;
	let className;
	let onAnimationEnd;
	let onClick;
	let rest;
	let t1;
	if ($[0] !== t0) {
		({className, children, type: t1, onClick, onAnimationEnd, ...rest} = t0);
		$[0] = t0;
		$[1] = children;
		$[2] = className;
		$[3] = onAnimationEnd;
		$[4] = onClick;
		$[5] = rest;
		$[6] = t1;
	} else {
		children = $[1];
		className = $[2];
		onAnimationEnd = $[3];
		onClick = $[4];
		rest = $[5];
		t1 = $[6];
	}
	const type = t1 === void 0 ? "button" : t1;
	const [isAnimating, setIsAnimating] = useState(false);
	let t2;
	if ($[7] !== onClick) {
		t2 = (e) => {
			setIsAnimating(true);
			onClick?.(e);
		};
		$[7] = onClick;
		$[8] = t2;
	} else t2 = $[8];
	const handleClick = t2;
	let t3;
	if ($[9] !== onAnimationEnd) {
		t3 = (e_0) => {
			setIsAnimating(false);
			onAnimationEnd?.(e_0);
		};
		$[9] = onAnimationEnd;
		$[10] = t3;
	} else t3 = $[10];
	const handleAnimationEnd = t3;
	let t4;
	if ($[11] !== className || $[12] !== isAnimating) {
		t4 = classnames(index_module_default$6.mediaButton, { [index_module_default$6.animate]: isAnimating }, className);
		$[11] = className;
		$[12] = isAnimating;
		$[13] = t4;
	} else t4 = $[13];
	let t5;
	if ($[14] !== children || $[15] !== handleAnimationEnd || $[16] !== handleClick || $[17] !== rest || $[18] !== t4 || $[19] !== type) {
		t5 = /* @__PURE__ */ jsx("button", {
			className: t4,
			type,
			onClick: handleClick,
			onAnimationEnd: handleAnimationEnd,
			...rest,
			children
		});
		$[14] = children;
		$[15] = handleAnimationEnd;
		$[16] = handleClick;
		$[17] = rest;
		$[18] = t4;
		$[19] = type;
		$[20] = t5;
	} else t5 = $[20];
	return t5;
});
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/MenuButton/icon_more.svg
const SvgIconMore = (props, ref) => /* @__PURE__ */ jsx("svg", {
	id: "vector",
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M5.5161,14.1665C5.8687,14.1665 6.1856,14.083 6.467,13.916C6.7485,13.749 6.9742,13.5264 7.1443,13.248C7.3144,12.9697 7.3994,12.6574 7.3994,12.311C7.3994,11.7977 7.217,11.3601 6.8521,10.9983C6.4871,10.6365 6.0418,10.4556 5.5161,10.4556C5.1759,10.4556 4.8652,10.5391 4.5837,10.7061C4.3023,10.873 4.0781,11.0972 3.9111,11.3787C3.7441,11.6601 3.6606,11.9709 3.6606,12.311C3.6606,12.6574 3.7441,12.9697 3.9111,13.248C4.0781,13.5264 4.3023,13.749 4.5837,13.916C4.8652,14.083 5.1759,14.1665 5.5161,14.1665ZM12.4092,14.1665C12.7555,14.1665 13.0679,14.083 13.3462,13.916C13.6245,13.749 13.8472,13.5264 14.0142,13.248C14.1812,12.9697 14.2646,12.6574 14.2646,12.311C14.2646,11.7977 14.0837,11.3601 13.7219,10.9983C13.3601,10.6365 12.9225,10.4556 12.4092,10.4556C12.069,10.4556 11.7582,10.5391 11.4768,10.7061C11.1954,10.873 10.9727,11.0972 10.8088,11.3787C10.6449,11.6601 10.563,11.9709 10.563,12.311C10.563,12.6574 10.6449,12.9697 10.8088,13.248C10.9727,13.5264 11.1954,13.749 11.4768,13.916C11.7582,14.083 12.069,14.1665 12.4092,14.1665ZM19.3022,14.1665C19.6424,14.1665 19.9532,14.083 20.2346,13.916C20.516,13.749 20.7402,13.5264 20.9072,13.248C21.0742,12.9697 21.1577,12.6574 21.1577,12.311C21.1577,11.7977 20.9768,11.3601 20.615,10.9983C20.2532,10.6365 19.8156,10.4556 19.3022,10.4556C18.9559,10.4556 18.6405,10.5391 18.356,10.7061C18.0715,10.873 17.8457,11.0972 17.6787,11.3787C17.5117,11.6601 17.4282,11.9709 17.4282,12.311C17.4282,12.6574 17.5117,12.9697 17.6787,13.248C17.8457,13.5264 18.0715,13.749 18.356,13.916C18.6405,14.083 18.9559,14.1665 19.3022,14.1665Z",
		fill: "currentColor",
		fillRule: "nonzero",
		id: "path_0"
	})
});
const ForwardRef$22 = forwardRef(SvgIconMore);
//#endregion
//#region src/components/MenuButton/index.module.css
var index_module_default$5 = { "menuButton": "PoF1Fq_menuButton" };
//#endregion
//#region src/components/MenuButton/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const MenuButton = memo((t0) => {
	const $ = c(9);
	let className;
	let rest;
	if ($[0] !== t0) {
		const { className: t1, type, ...t2 } = t0;
		className = t1;
		rest = t2;
		$[0] = t0;
		$[1] = className;
		$[2] = rest;
	} else {
		className = $[1];
		rest = $[2];
	}
	let t1;
	if ($[3] !== className) {
		t1 = classnames(index_module_default$5.menuButton, className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ jsx(ForwardRef$22, {});
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== rest || $[7] !== t1) {
		t3 = /* @__PURE__ */ jsx("button", {
			className: t1,
			type: "button",
			...rest,
			children: t2
		});
		$[6] = rest;
		$[7] = t1;
		$[8] = t3;
	} else t3 = $[8];
	return t3;
});
//#endregion
//#region src/components/TextMarquee/index.module.css
var index_module_default$4 = {
	"animating": "Q1LpsW_animating",
	"textMarquee": "Q1LpsW_textMarquee"
};
//#endregion
//#region src/components/TextMarquee/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const TextMarquee = memo((t0) => {
	const $ = c(15);
	let children;
	let className;
	let rest;
	if ($[0] !== t0) {
		({children, className, ...rest} = t0);
		$[0] = t0;
		$[1] = children;
		$[2] = className;
		$[3] = rest;
	} else {
		children = $[1];
		className = $[2];
		rest = $[3];
	}
	const outerDiv = useRef(null);
	const innerDiv = useRef(null);
	let t1;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ new Set();
		$[4] = t1;
	} else t1 = $[4];
	const currentAnimationsRef = useRef(t1);
	let t2;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = () => {
			if (innerDiv.current && outerDiv.current) {
				const outerWidth = outerDiv.current.clientWidth;
				const innerWidth = innerDiv.current.clientWidth;
				if (innerWidth <= outerWidth * .95) return;
				outerDiv.current?.classList.add(index_module_default$4.animating);
				const distance = innerWidth - outerWidth * .95;
				const ani = innerDiv.current.animate([{ transform: "translateX(0px)" }, { transform: `translateX(${-distance}px)` }], {
					iterations: 2,
					direction: "alternate",
					easing: "linear",
					duration: Math.max(0, distance * 2 / 64 * 1e3)
				});
				ani.finished.then(() => {
					outerDiv.current?.classList.remove(index_module_default$4.animating);
				});
				currentAnimationsRef.current.add(ani);
			}
		};
		$[5] = t2;
	} else t2 = $[5];
	const onMouseEnter = t2;
	let t3;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = () => {
			for (const ani_0 of currentAnimationsRef.current) ani_0.finish();
			outerDiv.current?.classList.remove(index_module_default$4.animating);
			currentAnimationsRef.current.clear();
		};
		$[6] = t3;
	} else t3 = $[6];
	const onMouseLeave = t3;
	let t4;
	if ($[7] !== className) {
		t4 = classnames(index_module_default$4.textMarquee, className);
		$[7] = className;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== children) {
		t5 = /* @__PURE__ */ jsx("div", {
			ref: innerDiv,
			children
		});
		$[9] = children;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== rest || $[12] !== t4 || $[13] !== t5) {
		t6 = /* @__PURE__ */ jsx("div", {
			ref: outerDiv,
			className: t4,
			onMouseEnter,
			onMouseLeave,
			...rest,
			children: t5
		});
		$[11] = rest;
		$[12] = t4;
		$[13] = t5;
		$[14] = t6;
	} else t6 = $[14];
	return t6;
});
//#endregion
//#region src/components/MusicInfo/index.module.css
var index_module_default$3 = {
	"album": "FhT8Ga_album",
	"artists": "FhT8Ga_artists",
	"info": "FhT8Ga_info",
	"musicInfo": "FhT8Ga_musicInfo",
	"name": "FhT8Ga_name"
};
//#endregion
//#region src/components/MusicInfo/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const MusicInfo = memo((t0) => {
	const $ = c(26);
	let album;
	let artists;
	let className;
	let name;
	let onMenuButtonClicked;
	let rest;
	if ($[0] !== t0) {
		const { name: t1, artists: t2, album: t3, onArtistClicked, onAlbumClicked, onMenuButtonClicked: t4, className: t5, ...t6 } = t0;
		name = t1;
		artists = t2;
		album = t3;
		onMenuButtonClicked = t4;
		className = t5;
		rest = t6;
		$[0] = t0;
		$[1] = album;
		$[2] = artists;
		$[3] = className;
		$[4] = name;
		$[5] = onMenuButtonClicked;
		$[6] = rest;
	} else {
		album = $[1];
		artists = $[2];
		className = $[3];
		name = $[4];
		onMenuButtonClicked = $[5];
		rest = $[6];
	}
	let t1;
	if ($[7] !== className) {
		t1 = classnames(index_module_default$3.musicInfo, className);
		$[7] = className;
		$[8] = t1;
	} else t1 = $[8];
	let t2;
	if ($[9] !== name) {
		t2 = name !== void 0 && /* @__PURE__ */ jsx(TextMarquee, {
			className: index_module_default$3.name,
			children: name
		});
		$[9] = name;
		$[10] = t2;
	} else t2 = $[10];
	let t3;
	if ($[11] !== artists) {
		t3 = artists !== void 0 && /* @__PURE__ */ jsx(TextMarquee, {
			className: index_module_default$3.artists,
			children: artists.map(_temp$1)
		});
		$[11] = artists;
		$[12] = t3;
	} else t3 = $[12];
	let t4;
	if ($[13] !== album) {
		t4 = album !== void 0 && /* @__PURE__ */ jsx(TextMarquee, {
			className: index_module_default$3.album,
			children: album
		});
		$[13] = album;
		$[14] = t4;
	} else t4 = $[14];
	let t5;
	if ($[15] !== t2 || $[16] !== t3 || $[17] !== t4) {
		t5 = /* @__PURE__ */ jsxs("div", {
			className: index_module_default$3.info,
			children: [
				t2,
				t3,
				t4
			]
		});
		$[15] = t2;
		$[16] = t3;
		$[17] = t4;
		$[18] = t5;
	} else t5 = $[18];
	let t6;
	if ($[19] !== onMenuButtonClicked) {
		t6 = /* @__PURE__ */ jsx(MenuButton, { onClick: onMenuButtonClicked });
		$[19] = onMenuButtonClicked;
		$[20] = t6;
	} else t6 = $[20];
	let t7;
	if ($[21] !== rest || $[22] !== t1 || $[23] !== t5 || $[24] !== t6) {
		t7 = /* @__PURE__ */ jsxs("div", {
			className: t1,
			...rest,
			children: [t5, t6]
		});
		$[21] = rest;
		$[22] = t1;
		$[23] = t5;
		$[24] = t6;
		$[25] = t7;
	} else t7 = $[25];
	return t7;
});
function _temp$1(v) {
	return /* @__PURE__ */ jsx("a", { children: v }, `artist-${v}`);
}
//#endregion
//#region src/layout/auto.module.css
var auto_module_default = { "background": "sgit_W_background" };
//#endregion
//#region src/layout/horizontal.module.css
var horizontal_module_default = {
	"bottomControls": "GFDHVW_bottomControls",
	"buttom-controls": "GFDHVW_buttom-controls",
	"controls": "GFDHVW_controls",
	"cover": "GFDHVW_cover",
	"drag-area": "GFDHVW_drag-area",
	"hideLyric": "GFDHVW_hideLyric",
	"horizontalLayout": "GFDHVW_horizontalLayout",
	"info-side": "GFDHVW_info-side",
	"lyric": "GFDHVW_lyric",
	"music-info": "GFDHVW_music-info",
	"player-side": "GFDHVW_player-side",
	"side-controls": "GFDHVW_side-controls",
	"thumb": "GFDHVW_thumb"
};
//#endregion
//#region src/layout/horizontal.tsx
/**
* @fileoverview
* 一个适用于歌词页面横向布局的组件
*/
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const HorizontalLayout = (t0) => {
	const $ = c(32);
	let asChild;
	let bottomControls;
	let className;
	let controlsSlot;
	let coverSlot;
	let hideLyric;
	let lyricSlot;
	let rest;
	let thumbSlot;
	if ($[0] !== t0) {
		({thumbSlot, coverSlot, controlsSlot, lyricSlot, bottomControls, hideLyric, className, asChild, ...rest} = t0);
		$[0] = t0;
		$[1] = asChild;
		$[2] = bottomControls;
		$[3] = className;
		$[4] = controlsSlot;
		$[5] = coverSlot;
		$[6] = hideLyric;
		$[7] = lyricSlot;
		$[8] = rest;
		$[9] = thumbSlot;
	} else {
		asChild = $[1];
		bottomControls = $[2];
		className = $[3];
		controlsSlot = $[4];
		coverSlot = $[5];
		hideLyric = $[6];
		lyricSlot = $[7];
		rest = $[8];
		thumbSlot = $[9];
	}
	const t1 = !asChild && horizontal_module_default.horizontalLayout;
	const t2 = !asChild && hideLyric && horizontal_module_default.hideLyric;
	let t3;
	if ($[10] !== className || $[11] !== t1 || $[12] !== t2) {
		t3 = classnames(className, t1, t2);
		$[10] = className;
		$[11] = t1;
		$[12] = t2;
		$[13] = t3;
	} else t3 = $[13];
	let t4;
	if ($[14] !== thumbSlot) {
		t4 = /* @__PURE__ */ jsx(motion.div, {
			layout: true,
			layoutId: "amll-player-thumb",
			className: horizontal_module_default.thumb,
			children: thumbSlot
		});
		$[14] = thumbSlot;
		$[15] = t4;
	} else t4 = $[15];
	let t5;
	if ($[16] !== coverSlot) {
		t5 = /* @__PURE__ */ jsx(motion.div, {
			layout: true,
			layoutId: "amll-player-cover",
			className: horizontal_module_default.cover,
			children: coverSlot
		});
		$[16] = coverSlot;
		$[17] = t5;
	} else t5 = $[17];
	let t6;
	if ($[18] !== controlsSlot) {
		t6 = /* @__PURE__ */ jsx(motion.div, {
			layout: true,
			layoutId: "amll-player-controls",
			className: horizontal_module_default.controls,
			children: controlsSlot
		});
		$[18] = controlsSlot;
		$[19] = t6;
	} else t6 = $[19];
	let t7;
	if ($[20] !== lyricSlot) {
		t7 = /* @__PURE__ */ jsx("div", {
			className: horizontal_module_default.lyric,
			children: lyricSlot
		});
		$[20] = lyricSlot;
		$[21] = t7;
	} else t7 = $[21];
	let t8;
	if ($[22] !== bottomControls) {
		t8 = /* @__PURE__ */ jsx("div", {
			className: horizontal_module_default.bottomControls,
			children: bottomControls
		});
		$[22] = bottomControls;
		$[23] = t8;
	} else t8 = $[23];
	let t9;
	if ($[24] !== rest || $[25] !== t3 || $[26] !== t4 || $[27] !== t5 || $[28] !== t6 || $[29] !== t7 || $[30] !== t8) {
		t9 = /* @__PURE__ */ jsxs("div", {
			className: t3,
			...rest,
			children: [
				t4,
				t5,
				t6,
				t7,
				t8
			]
		});
		$[24] = rest;
		$[25] = t3;
		$[26] = t4;
		$[27] = t5;
		$[28] = t6;
		$[29] = t7;
		$[30] = t8;
		$[31] = t9;
	} else t9 = $[31];
	return t9;
};
//#endregion
//#region src/layout/vertical.module.css
var vertical_module_default = {
	"background": "_7-t4Qq_background",
	"bigControls": "_7-t4Qq_bigControls",
	"bottom-controls": "_7-t4Qq_bottom-controls",
	"control": "_7-t4Qq_control",
	"controls": "_7-t4Qq_controls",
	"cover": "_7-t4Qq_cover",
	"cover-side": "_7-t4Qq_cover-side",
	"cover-view": "_7-t4Qq_cover-view",
	"coverFrame": "_7-t4Qq_coverFrame",
	"drag-area": "_7-t4Qq_drag-area",
	"hideLyric": "_7-t4Qq_hideLyric",
	"immerseCover": "_7-t4Qq_immerseCover",
	"info-side": "_7-t4Qq_info-side",
	"lyric": "_7-t4Qq_lyric",
	"lyric-view": "_7-t4Qq_lyric-view",
	"lyricLayout": "_7-t4Qq_lyricLayout",
	"main-view": "_7-t4Qq_main-view",
	"noLyricLayout": "_7-t4Qq_noLyricLayout",
	"phonyBigCover": "_7-t4Qq_phonyBigCover",
	"phonySmallCover": "_7-t4Qq_phonySmallCover",
	"smallControls": "_7-t4Qq_smallControls",
	"thumb": "_7-t4Qq_thumb",
	"verticalLayout": "_7-t4Qq_verticalLayout"
};
//#endregion
//#region src/layout/vertical.tsx
/**
* @fileoverview
* 一个适用于歌词页面竖向布局的组件
*/
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const VerticalLayout = ({ thumbSlot, coverSlot, smallControlsSlot, bigControlsSlot, lyricSlot, hideLyric, asChild, className, immerseCover, ...rest }) => {
	const rootRef = useRef(null);
	const phonyBigCoverRef = useRef(null);
	const phonySmallCoverRef = useRef(null);
	const coverFrameRef = useRef(null);
	const hideLyricRef = useRef(hideLyric ?? false);
	const immerseCoverRef = useRef(immerseCover ?? false);
	const [currentCoverStyle, setCurrentCoverStyle] = useState(void 0);
	const calcCoverLayout = useCallback((hideLyric_0 = hideLyricRef.current) => {
		if (!rootRef.current) return;
		let rootEl = rootRef.current;
		const targetCover = hideLyric_0 ? phonyBigCoverRef.current : phonySmallCoverRef.current;
		if (!targetCover || !rootEl) return;
		const immerseCover_0 = immerseCoverRef.current;
		while (getComputedStyle(rootEl).display === "contents") {
			const parentEl = rootEl.parentElement;
			if (!parentEl) return;
			rootEl = parentEl;
		}
		const rootB = rootEl.getBoundingClientRect();
		const targetCoverB = targetCover.getBoundingClientRect();
		if (immerseCover_0) {
			const halfHeight = targetCoverB.top - rootB.top + targetCoverB.height / 2;
			const targetCoverSize = Math.max(halfHeight * 2.4, rootB.width * 1.2, Math.min(targetCover.clientWidth, targetCover.clientHeight));
			return {
				width: targetCoverSize,
				height: targetCoverSize,
				left: targetCoverB.x - rootB.x + (targetCoverB.width - targetCoverSize) / 2,
				top: targetCoverB.y - rootB.y + (targetCoverB.height - targetCoverSize) / 2
			};
		}
		const targetCoverSize_0 = Math.min(targetCover.clientWidth, targetCover.clientHeight);
		return {
			width: targetCoverSize_0,
			height: targetCoverSize_0,
			left: targetCoverB.x - rootB.x + (targetCoverB.width - targetCoverSize_0) / 2,
			top: targetCoverB.y - rootB.y + (targetCoverB.height - targetCoverSize_0) / 2
		};
	}, []);
	useLayoutEffect(() => {
		hideLyricRef.current = hideLyric ?? false;
		immerseCoverRef.current = immerseCover ?? false;
		setCurrentCoverStyle(calcCoverLayout(hideLyricRef.current));
	}, [
		hideLyric,
		immerseCover,
		calcCoverLayout
	]);
	useLayoutEffect(() => {
		const phonyBigCoverEl = phonyBigCoverRef.current;
		const phonySmallCoverEl = phonySmallCoverRef.current;
		if (!phonyBigCoverEl || !phonySmallCoverEl) return;
		const obz = new ResizeObserver(() => {
			setCurrentCoverStyle(calcCoverLayout(hideLyricRef.current));
		});
		obz.observe(phonyBigCoverEl);
		obz.observe(phonySmallCoverEl);
		setCurrentCoverStyle(calcCoverLayout(hideLyricRef.current));
		return () => {
			obz.disconnect();
		};
	}, [calcCoverLayout]);
	return /* @__PURE__ */ jsxs("div", {
		className: classnames(className, !asChild && vertical_module_default.verticalLayout, !asChild && hideLyric && vertical_module_default.hideLyric),
		ref: rootRef,
		...rest,
		children: [
			/* @__PURE__ */ jsx("div", {
				className: vertical_module_default.thumb,
				children: thumbSlot
			}),
			/* @__PURE__ */ jsxs("div", {
				className: vertical_module_default.lyricLayout,
				children: [
					/* @__PURE__ */ jsx("div", {
						className: vertical_module_default.phonySmallCover,
						ref: phonySmallCoverRef
					}),
					/* @__PURE__ */ jsx("div", {
						className: vertical_module_default.smallControls,
						children: smallControlsSlot
					}),
					/* @__PURE__ */ jsx("div", {
						className: vertical_module_default.lyric,
						children: lyricSlot
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: vertical_module_default.noLyricLayout,
				children: [/* @__PURE__ */ jsx("div", {
					className: vertical_module_default.phonyBigCover,
					ref: phonyBigCoverRef
				}), /* @__PURE__ */ jsx("div", {
					className: vertical_module_default.bigControls,
					children: bigControlsSlot
				})]
			}),
			currentCoverStyle && /* @__PURE__ */ jsx(motion.div, {
				className: classnames(vertical_module_default.coverFrame, immerseCover && vertical_module_default.immerseCover),
				animate: currentCoverStyle,
				initial: false,
				transition: {
					type: "spring",
					stiffness: 200,
					damping: 30
				},
				ref: coverFrameRef,
				children: coverSlot
			})
		]
	});
};
//#endregion
//#region src/layout/auto.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
/**
* 会根据当前元素的宽高比自动选择横向或者纵向布局的组件
*/
const AutoLyricLayout = (t0) => {
	const $ = c(40);
	let backgroundSlot;
	let bigControlsSlot;
	let controlsSlot;
	let coverSlot;
	let hideLyric;
	let horizontalBottomControls;
	let lyricSlot;
	let onElementMounted;
	let onLayoutChange;
	let rest;
	let smallControlsSlot;
	let thumbSlot;
	let verticalImmerseCover;
	if ($[0] !== t0) {
		({thumbSlot, controlsSlot, horizontalBottomControls, smallControlsSlot, bigControlsSlot, coverSlot, lyricSlot, backgroundSlot, hideLyric, verticalImmerseCover, onLayoutChange, onElementMounted, ...rest} = t0);
		$[0] = t0;
		$[1] = backgroundSlot;
		$[2] = bigControlsSlot;
		$[3] = controlsSlot;
		$[4] = coverSlot;
		$[5] = hideLyric;
		$[6] = horizontalBottomControls;
		$[7] = lyricSlot;
		$[8] = onElementMounted;
		$[9] = onLayoutChange;
		$[10] = rest;
		$[11] = smallControlsSlot;
		$[12] = thumbSlot;
		$[13] = verticalImmerseCover;
	} else {
		backgroundSlot = $[1];
		bigControlsSlot = $[2];
		controlsSlot = $[3];
		coverSlot = $[4];
		hideLyric = $[5];
		horizontalBottomControls = $[6];
		lyricSlot = $[7];
		onElementMounted = $[8];
		onLayoutChange = $[9];
		rest = $[10];
		smallControlsSlot = $[11];
		thumbSlot = $[12];
		verticalImmerseCover = $[13];
	}
	const [isVertical, setIsVertical] = useState(false);
	const rootRef = useRef(null);
	let t1;
	if ($[14] !== onElementMounted) {
		t1 = (node) => {
			rootRef.current = node;
			if (onElementMounted) onElementMounted(node);
		};
		$[14] = onElementMounted;
		$[15] = t1;
	} else t1 = $[15];
	const setRefs = t1;
	let t2;
	let t3;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = () => {
			const rootEl = rootRef.current;
			if (!rootEl) return;
			setIsVertical(rootEl.clientWidth < rootEl.clientHeight);
			const obz = new ResizeObserver(() => {
				const rootB = rootEl.getBoundingClientRect();
				setIsVertical(rootB.width < rootB.height);
			});
			obz.observe(rootEl);
			return () => obz.disconnect();
		};
		t3 = [];
		$[16] = t2;
		$[17] = t3;
	} else {
		t2 = $[16];
		t3 = $[17];
	}
	useLayoutEffect(t2, t3);
	let t4;
	let t5;
	if ($[18] !== isVertical || $[19] !== onLayoutChange) {
		t4 = () => {
			onLayoutChange?.(isVertical);
		};
		t5 = [isVertical, onLayoutChange];
		$[18] = isVertical;
		$[19] = onLayoutChange;
		$[20] = t4;
		$[21] = t5;
	} else {
		t4 = $[20];
		t5 = $[21];
	}
	useLayoutEffect(t4, t5);
	let t6;
	if ($[22] !== backgroundSlot) {
		t6 = /* @__PURE__ */ jsx("div", {
			className: auto_module_default.background,
			children: backgroundSlot
		});
		$[22] = backgroundSlot;
		$[23] = t6;
	} else t6 = $[23];
	let t7;
	if ($[24] !== bigControlsSlot || $[25] !== controlsSlot || $[26] !== coverSlot || $[27] !== hideLyric || $[28] !== horizontalBottomControls || $[29] !== isVertical || $[30] !== lyricSlot || $[31] !== smallControlsSlot || $[32] !== thumbSlot || $[33] !== verticalImmerseCover) {
		t7 = isVertical ? /* @__PURE__ */ jsx(VerticalLayout, {
			thumbSlot,
			smallControlsSlot,
			bigControlsSlot,
			coverSlot,
			lyricSlot,
			hideLyric,
			immerseCover: verticalImmerseCover
		}) : /* @__PURE__ */ jsx(HorizontalLayout, {
			thumbSlot,
			controlsSlot,
			coverSlot,
			lyricSlot,
			bottomControls: horizontalBottomControls,
			hideLyric
		});
		$[24] = bigControlsSlot;
		$[25] = controlsSlot;
		$[26] = coverSlot;
		$[27] = hideLyric;
		$[28] = horizontalBottomControls;
		$[29] = isVertical;
		$[30] = lyricSlot;
		$[31] = smallControlsSlot;
		$[32] = thumbSlot;
		$[33] = verticalImmerseCover;
		$[34] = t7;
	} else t7 = $[34];
	let t8;
	if ($[35] !== rest || $[36] !== setRefs || $[37] !== t6 || $[38] !== t7) {
		t8 = /* @__PURE__ */ jsxs("div", {
			...rest,
			ref: setRefs,
			children: [t6, t7]
		});
		$[35] = rest;
		$[36] = setRefs;
		$[37] = t6;
		$[38] = t7;
		$[39] = t8;
	} else t8 = $[39];
	return t8;
};
//#endregion
//#region src/utils/duration.ts
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
function toDuration(duration) {
	const isRemainTime = duration < 0;
	const d = Math.abs(duration | 0);
	const sec = d % 60;
	const min = Math.floor((d - sec) / 60);
	const secText = "0".repeat(2 - sec.toString().length) + sec;
	return `${isRemainTime ? "-" : ""}${min}:${secText}`;
}
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/IconButton/airplay.svg
const SvgAirplay = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 64,
	height: 64,
	viewBox: "0 0 64 64",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M11.8633 31.8984C11.8633 29.138 12.3841 26.5469 13.4258 24.125C14.4674 21.6901 15.9128 19.5482 17.7617 17.6992C19.6107 15.8372 21.7526 14.3854 24.1875 13.3438C26.6224 12.2891 29.2266 11.7617 32 11.7617C34.7734 11.7617 37.3776 12.2891 39.8125 13.3438C42.2474 14.3854 44.3893 15.8372 46.2383 17.6992C48.0872 19.5482 49.5326 21.6901 50.5742 24.125C51.6159 26.5469 52.1367 29.138 52.1367 31.8984C52.1367 34.6719 51.6029 37.2826 50.5352 39.7305C49.4674 42.1784 48.0156 44.3073 46.1797 46.1172C46.0365 46.2604 45.8802 46.332 45.7109 46.332C45.5547 46.332 45.4049 46.2539 45.2617 46.0977L44.3438 45.0625C44.0964 44.763 44.1094 44.4635 44.3828 44.1641C45.9453 42.6016 47.1823 40.7656 48.0938 38.6562C49.0182 36.5339 49.4805 34.2812 49.4805 31.8984C49.4805 29.5026 49.0247 27.2565 48.1133 25.1602C47.2018 23.0508 45.9388 21.1953 44.3242 19.5938C42.7227 17.9792 40.8672 16.7161 38.7578 15.8047C36.6484 14.8932 34.3958 14.4375 32 14.4375C29.6042 14.4375 27.3516 14.8932 25.2422 15.8047C23.1328 16.7161 21.2708 17.9792 19.6562 19.5938C18.0547 21.1953 16.7982 23.0508 15.8867 25.1602C14.9753 27.2565 14.5195 29.5026 14.5195 31.8984C14.5195 34.2812 14.9753 36.5273 15.8867 38.6367C16.7982 40.7461 18.0417 42.5885 19.6172 44.1641C19.8776 44.4635 19.8841 44.7565 19.6367 45.043L18.7188 46.0781C18.5885 46.2344 18.4323 46.3125 18.25 46.3125C18.0807 46.3125 17.9245 46.2409 17.7812 46.0977C15.9583 44.2878 14.513 42.1654 13.4453 39.7305C12.3906 37.2826 11.8633 34.6719 11.8633 31.8984ZM17.5469 31.8984C17.5469 29.9193 17.918 28.0573 18.6602 26.3125C19.4154 24.5677 20.457 23.0312 21.7852 21.7031C23.1133 20.375 24.6497 19.3333 26.3945 18.5781C28.1393 17.8229 30.0078 17.4453 32 17.4453C33.9792 17.4453 35.8411 17.8229 37.5859 18.5781C39.3438 19.3333 40.8867 20.375 42.2148 21.7031C43.543 23.0312 44.5781 24.5677 45.3203 26.3125C46.0755 28.0573 46.4531 29.9193 46.4531 31.8984C46.4531 33.8255 46.0885 35.6419 45.3594 37.3477C44.6432 39.0404 43.6667 40.5312 42.4297 41.8203C42.2865 41.9766 42.1237 42.0547 41.9414 42.0547C41.7721 42.0547 41.6224 41.9766 41.4922 41.8203L40.5547 40.7852C40.3073 40.5117 40.3073 40.2122 40.5547 39.8867C41.5573 38.8581 42.3451 37.6602 42.918 36.293C43.4909 34.9128 43.7773 33.4479 43.7773 31.8984C43.7773 30.2839 43.4714 28.7669 42.8594 27.3477C42.2474 25.9284 41.3945 24.6784 40.3008 23.5977C39.2201 22.5169 37.9701 21.6706 36.5508 21.0586C35.1315 20.4336 33.6146 20.1211 32 20.1211C30.3724 20.1211 28.849 20.4336 27.4297 21.0586C26.0104 21.6706 24.7604 22.5169 23.6797 23.5977C22.599 24.6784 21.7526 25.9284 21.1406 27.3477C20.5286 28.7669 20.2227 30.2839 20.2227 31.8984C20.2227 33.4349 20.5026 34.8932 21.0625 36.2734C21.6354 37.6536 22.4232 38.8581 23.4258 39.8867C23.6732 40.2122 23.6732 40.5117 23.4258 40.7852L22.5078 41.8008C22.3776 41.957 22.2214 42.0417 22.0391 42.0547C21.8568 42.0547 21.694 41.9701 21.5508 41.8008C20.3138 40.5117 19.3372 39.0208 18.6211 37.3281C17.9049 35.6224 17.5469 33.8125 17.5469 31.8984ZM23.2305 31.8984C23.2305 30.2969 23.6276 28.832 24.4219 27.5039C25.2161 26.1758 26.2708 25.1146 27.5859 24.3203C28.9141 23.526 30.3854 23.1289 32 23.1289C33.6146 23.1289 35.0794 23.526 36.3945 24.3203C37.7227 25.1146 38.7839 26.1758 39.5781 27.5039C40.3724 28.832 40.7695 30.2969 40.7695 31.8984C40.7695 32.9661 40.5807 33.9753 40.2031 34.9258C39.8255 35.8633 39.3047 36.7031 38.6406 37.4453C38.5104 37.6276 38.3542 37.7188 38.1719 37.7188C38.0026 37.7188 37.8398 37.6406 37.6836 37.4844L36.7266 36.4688C36.4792 36.2214 36.4596 35.9414 36.668 35.6289C37.1237 35.1341 37.4753 34.5677 37.7227 33.9297C37.9701 33.2917 38.0938 32.6146 38.0938 31.8984C38.0938 30.7917 37.8138 29.776 37.2539 28.8516C36.707 27.9271 35.9714 27.1914 35.0469 26.6445C34.1224 26.0846 33.1068 25.8047 32 25.8047C30.8932 25.8047 29.8776 26.0846 28.9531 26.6445C28.0286 27.1914 27.2865 27.9271 26.7266 28.8516C26.1797 29.776 25.9062 30.7917 25.9062 31.8984C25.9062 32.6016 26.0299 33.2721 26.2773 33.9102C26.5247 34.5482 26.8698 35.1146 27.3125 35.6094C27.5078 35.9219 27.4883 36.2018 27.2539 36.4492L26.2969 37.4648C26.1406 37.6211 25.9714 37.6992 25.7891 37.6992C25.6198 37.6992 25.4701 37.6146 25.3398 37.4453C24.6758 36.7031 24.1549 35.8568 23.7773 34.9062C23.4128 33.9557 23.2305 32.9531 23.2305 31.8984ZM19.8906 51.3711C19.4089 51.3711 19.0898 51.1758 18.9336 50.7852C18.7773 50.3945 18.8555 50.0299 19.168 49.6914L31.1016 36.1758C31.3359 35.9023 31.6289 35.7656 31.9805 35.7656C32.332 35.7656 32.625 35.9023 32.8594 36.1758L44.8125 49.6914C45.112 50.0299 45.1836 50.3945 45.0273 50.7852C44.8711 51.1758 44.5586 51.3711 44.0898 51.3711H19.8906Z",
		fill: "currentColor"
	})
});
const ForwardRef$21 = forwardRef(SvgAirplay);
//#endregion
//#region src/components/ToggleIconButton/index.module.css
var index_module_default$2 = { "toggleIconButton": "J9_SVW_toggleIconButton" };
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/lyrics_off.svg
const SvgLyricsOff = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 64,
	height: 64,
	viewBox: "0 0 64 64",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M22.8594 53.9102C22 53.9102 21.3229 53.6302 20.8281 53.0703C20.3464 52.5104 20.1055 51.7617 20.1055 50.8242V46.1953H18.9727C17.1237 46.1953 15.5156 45.8242 14.1484 45.082C12.7812 44.3398 11.7201 43.2721 10.9648 41.8789C10.2227 40.4857 9.85156 38.8125 9.85156 36.8594V21.5664C9.85156 19.6133 10.2161 17.9401 10.9453 16.5469C11.6875 15.1536 12.7552 14.0859 14.1484 13.3438C15.5417 12.5885 17.2214 12.2109 19.1875 12.2109H44.793C46.7721 12.2109 48.4518 12.5885 49.832 13.3438C51.2253 14.0859 52.2865 15.1536 53.0156 16.5469C53.7578 17.9401 54.1289 19.6133 54.1289 21.5664V36.8594C54.1289 38.8125 53.7578 40.4857 53.0156 41.8789C52.2865 43.2721 51.2253 44.3398 49.832 45.082C48.4518 45.8242 46.7721 46.1953 44.793 46.1953H33.0742L26.4336 52.0547C25.7044 52.6927 25.0729 53.1615 24.5391 53.4609C24.0182 53.7604 23.4583 53.9102 22.8594 53.9102ZM23.9141 49.0469L30.0859 42.9727C30.5156 42.5299 30.9193 42.237 31.2969 42.0938C31.6745 41.9375 32.1758 41.8594 32.8008 41.8594H44.5977C46.3424 41.8594 47.6445 41.4232 48.5039 40.5508C49.3633 39.6784 49.793 38.3828 49.793 36.6641V21.7422C49.793 20.0365 49.3633 18.7474 48.5039 17.875C47.6445 17.0026 46.3424 16.5664 44.5977 16.5664H19.3828C17.625 16.5664 16.3164 17.0026 15.457 17.875C14.6107 18.7474 14.1875 20.0365 14.1875 21.7422V36.6641C14.1875 38.3828 14.6107 39.6784 15.457 40.5508C16.3164 41.4232 17.625 41.8594 19.3828 41.8594H22.2344C22.8073 41.8594 23.2305 41.9896 23.5039 42.25C23.7773 42.4974 23.9141 42.9271 23.9141 43.5391V49.0469ZM22.4492 27.1914C22.4492 25.9935 22.8529 25.0104 23.6602 24.2422C24.4674 23.474 25.4701 23.0898 26.668 23.0898C28.0221 23.0898 29.1029 23.5716 29.9102 24.5352C30.7305 25.4857 31.1406 26.6576 31.1406 28.0508C31.1406 29.2096 30.9323 30.2383 30.5156 31.1367C30.112 32.0221 29.5911 32.7708 28.9531 33.3828C28.3281 33.9948 27.6771 34.457 27 34.7695C26.3229 35.082 25.7174 35.2383 25.1836 35.2383C24.8841 35.2383 24.6367 35.1536 24.4414 34.9844C24.2461 34.8151 24.1484 34.5938 24.1484 34.3203C24.1484 34.0859 24.2135 33.8906 24.3438 33.7344C24.487 33.5651 24.7214 33.4414 25.0469 33.3633C25.5677 33.2331 26.0625 33.0312 26.5312 32.7578C27.013 32.4714 27.4362 32.1328 27.8008 31.7422C28.1654 31.3385 28.4453 30.8828 28.6406 30.375H28.3867C28.1263 30.7005 27.7943 30.9284 27.3906 31.0586C26.987 31.1758 26.5573 31.2344 26.1016 31.2344C25.0078 31.2344 24.1224 30.8503 23.4453 30.082C22.7812 29.3008 22.4492 28.3372 22.4492 27.1914ZM33.0742 27.1914C33.0742 25.9935 33.4714 25.0104 34.2656 24.2422C35.0729 23.474 36.082 23.0898 37.293 23.0898C38.6471 23.0898 39.7279 23.5716 40.5352 24.5352C41.3555 25.4857 41.7656 26.6576 41.7656 28.0508C41.7656 29.2096 41.5573 30.2383 41.1406 31.1367C40.737 32.0221 40.2161 32.7708 39.5781 33.3828C38.9531 33.9948 38.2956 34.457 37.6055 34.7695C36.9284 35.082 36.3294 35.2383 35.8086 35.2383C35.5091 35.2383 35.2617 35.1536 35.0664 34.9844C34.8711 34.8151 34.7734 34.5938 34.7734 34.3203C34.7734 34.0859 34.8385 33.8906 34.9688 33.7344C35.112 33.5651 35.3529 33.4414 35.6914 33.3633C36.1992 33.2331 36.6875 33.0312 37.1562 32.7578C37.638 32.4714 38.0612 32.1328 38.4258 31.7422C38.7904 31.3385 39.0703 30.8828 39.2656 30.375H39.0117C38.7513 30.7005 38.4193 30.9284 38.0156 31.0586C37.612 31.1758 37.1823 31.2344 36.7266 31.2344C35.6328 31.2344 34.7474 30.8503 34.0703 30.082C33.4062 29.3008 33.0742 28.3372 33.0742 27.1914Z",
		fill: "currentColor"
	})
});
const ForwardRef$20 = forwardRef(SvgLyricsOff);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/lyrics_on.svg
const SvgLyricsOn = (props, ref) => /* @__PURE__ */ jsxs("svg", {
	width: 64,
	height: 64,
	viewBox: "0 0 64 64",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: [/* @__PURE__ */ jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M1.91256 7.67068C0 11.0858 0 15.6405 0 24.75V39.25C0 48.3595 0 52.9142 1.91256 56.3293C3.26425 58.7429 5.25707 60.7357 7.67068 62.0874C11.0858 64 15.6405 64 24.75 64H39.25C48.3595 64 52.9142 64 56.3293 62.0874C58.7429 60.7357 60.7357 58.7429 62.0874 56.3293C64 52.9142 64 48.3595 64 39.25V24.75C64 15.6405 64 11.0858 62.0874 7.67068C60.7357 5.25707 58.7429 3.26425 56.3293 1.91256C52.9142 0 48.3595 0 39.25 0H24.75C15.6405 0 11.0858 0 7.67068 1.91256C5.25707 3.26425 3.26425 5.25707 1.91256 7.67068ZM20.8281 53.0703C21.3229 53.6302 22 53.9102 22.8594 53.9102C23.4583 53.9102 24.0182 53.7604 24.5391 53.4609C25.0729 53.1615 25.7044 52.6927 26.4336 52.0547L33.0742 46.1953H44.793C46.7721 46.1953 48.4518 45.8242 49.832 45.082C51.2253 44.3398 52.2865 43.2721 53.0156 41.8789C53.7578 40.4857 54.1289 38.8125 54.1289 36.8594V21.5664C54.1289 19.6133 53.7578 17.9401 53.0156 16.5469C52.2865 15.1536 51.2253 14.0859 49.832 13.3438C48.4518 12.5885 46.7721 12.2109 44.793 12.2109H19.1875C17.2214 12.2109 15.5417 12.5885 14.1484 13.3438C12.7552 14.0859 11.6875 15.1536 10.9453 16.5469C10.2161 17.9401 9.85156 19.6133 9.85156 21.5664V36.8594C9.85156 38.8125 10.2227 40.4857 10.9648 41.8789C11.7201 43.2721 12.7812 44.3398 14.1484 45.082C15.5156 45.8242 17.1237 46.1953 18.9727 46.1953H20.1055V50.8242C20.1055 51.7617 20.3464 52.5104 20.8281 53.0703Z",
		fill: "currentColor"
	}), /* @__PURE__ */ jsx("path", {
		d: "M22.4492 27.1914C22.4492 25.9935 22.8529 25.0104 23.6602 24.2422C24.4674 23.474 25.4701 23.0898 26.668 23.0898C28.0221 23.0898 29.1029 23.5716 29.9102 24.5352C30.7305 25.4857 31.1406 26.6576 31.1406 28.0508C31.1406 29.2096 30.9323 30.2383 30.5156 31.1367C30.112 32.0221 29.5911 32.7708 28.9531 33.3828C28.3281 33.9948 27.6771 34.457 27 34.7695C26.3229 35.082 25.7174 35.2383 25.1836 35.2383C24.8841 35.2383 24.6367 35.1536 24.4414 34.9844C24.2461 34.8151 24.1484 34.5938 24.1484 34.3203C24.1484 34.0859 24.2135 33.8906 24.3438 33.7344C24.487 33.5651 24.7214 33.4414 25.0469 33.3633C25.5677 33.2331 26.0625 33.0312 26.5312 32.7578C27.013 32.4714 27.4362 32.1328 27.8008 31.7422C28.1654 31.3385 28.4453 30.8828 28.6406 30.375H28.3867C28.1263 30.7005 27.7943 30.9284 27.3906 31.0586C26.987 31.1758 26.5573 31.2344 26.1016 31.2344C25.0078 31.2344 24.1224 30.8503 23.4453 30.082C22.7812 29.3008 22.4492 28.3372 22.4492 27.1914ZM33.0742 27.1914C33.0742 25.9935 33.4714 25.0104 34.2656 24.2422C35.0729 23.474 36.082 23.0898 37.293 23.0898C38.6471 23.0898 39.7279 23.5716 40.5352 24.5352C41.3555 25.4857 41.7656 26.6576 41.7656 28.0508C41.7656 29.2096 41.5573 30.2383 41.1406 31.1367C40.737 32.0221 40.2161 32.7708 39.5781 33.3828C38.9531 33.9948 38.2956 34.457 37.6055 34.7695C36.9284 35.082 36.3294 35.2383 35.8086 35.2383C35.5091 35.2383 35.2617 35.1536 35.0664 34.9844C34.8711 34.8151 34.7734 34.5938 34.7734 34.3203C34.7734 34.0859 34.8385 33.8906 34.9688 33.7344C35.112 33.5651 35.3529 33.4414 35.6914 33.3633C36.1992 33.2331 36.6875 33.0312 37.1562 32.7578C37.638 32.4714 38.0612 32.1328 38.4258 31.7422C38.7904 31.3385 39.0703 30.8828 39.2656 30.375H39.0117C38.7513 30.7005 38.4193 30.9284 38.0156 31.0586C37.612 31.1758 37.1823 31.2344 36.7266 31.2344C35.6328 31.2344 34.7474 30.8503 34.0703 30.082C33.4062 29.3008 33.0742 28.3372 33.0742 27.1914Z",
		fill: "currentColor"
	})]
});
const ForwardRef$19 = forwardRef(SvgLyricsOn);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/playlist_off.svg
const SvgPlaylistOff = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 64,
	height: 64,
	viewBox: "0 0 64 64",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M23.9922 21.8594C23.4062 21.8594 22.9115 21.6641 22.5078 21.2734C22.1172 20.8698 21.9219 20.375 21.9219 19.7891C21.9219 19.2161 22.1172 18.7279 22.5078 18.3242C22.9115 17.9206 23.4062 17.7188 23.9922 17.7188H50.418C50.9909 17.7188 51.4792 17.9206 51.8828 18.3242C52.2865 18.7279 52.4883 19.2161 52.4883 19.7891C52.4883 20.375 52.2865 20.8698 51.8828 21.2734C51.4792 21.6641 50.9909 21.8594 50.418 21.8594H23.9922ZM23.9922 33.9883C23.4062 33.9883 22.9115 33.7865 22.5078 33.3828C22.1172 32.9792 21.9219 32.4909 21.9219 31.918C21.9219 31.3451 22.1172 30.8633 22.5078 30.4727C22.9115 30.069 23.4062 29.8672 23.9922 29.8672H50.418C50.9909 29.8672 51.4792 30.069 51.8828 30.4727C52.2865 30.8633 52.4883 31.3451 52.4883 31.918C52.4883 32.5039 52.2865 32.9987 51.8828 33.4023C51.4792 33.793 50.9909 33.9883 50.418 33.9883H23.9922ZM23.9922 46.1172C23.4062 46.1172 22.9115 45.9219 22.5078 45.5312C22.1172 45.1276 21.9219 44.6328 21.9219 44.0469C21.9219 43.474 22.1172 42.9857 22.5078 42.582C22.9115 42.1784 23.4062 41.9766 23.9922 41.9766H50.418C50.9909 41.9766 51.4792 42.1784 51.8828 42.582C52.2865 42.9857 52.4883 43.474 52.4883 44.0469C52.4883 44.6328 52.2865 45.1276 51.8828 45.5312C51.4792 45.9219 50.9909 46.1172 50.418 46.1172H23.9922ZM14.4805 22.7383C13.6602 22.7383 12.957 22.4518 12.3711 21.8789C11.7982 21.306 11.5117 20.6094 11.5117 19.7891C11.5117 18.9688 11.7982 18.2721 12.3711 17.6992C12.957 17.1263 13.6602 16.8398 14.4805 16.8398C15.2878 16.8398 15.9844 17.1263 16.5703 17.6992C17.1562 18.2721 17.4492 18.9688 17.4492 19.7891C17.4492 20.6094 17.1562 21.306 16.5703 21.8789C15.9844 22.4518 15.2878 22.7383 14.4805 22.7383ZM14.4805 34.8867C13.6602 34.8867 12.957 34.5938 12.3711 34.0078C11.7982 33.4219 11.5117 32.7253 11.5117 31.918C11.5117 31.1107 11.7982 30.4141 12.3711 29.8281C12.957 29.2422 13.6602 28.9492 14.4805 28.9492C15.2878 28.9492 15.9844 29.2422 16.5703 29.8281C17.1562 30.4141 17.4492 31.1107 17.4492 31.918C17.4492 32.7253 17.1562 33.4219 16.5703 34.0078C15.9844 34.5938 15.2878 34.8867 14.4805 34.8867ZM14.4805 47.0156C13.6602 47.0156 12.957 46.7227 12.3711 46.1367C11.7982 45.5638 11.5117 44.8672 11.5117 44.0469C11.5117 43.2266 11.7982 42.5299 12.3711 41.957C12.957 41.3841 13.6602 41.0977 14.4805 41.0977C15.2878 41.0977 15.9844 41.3841 16.5703 41.957C17.1562 42.5299 17.4492 43.2266 17.4492 44.0469C17.4492 44.8672 17.1562 45.5638 16.5703 46.1367C15.9844 46.7227 15.2878 47.0156 14.4805 47.0156Z",
		fill: "currentColor"
	})
});
const ForwardRef$18 = forwardRef(SvgPlaylistOff);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/playlist_on.svg
const SvgPlaylistOn = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 64,
	height: 64,
	viewBox: "0 0 64 64",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M1.91256 7.67068C0 11.0858 0 15.6405 0 24.75V39.25C0 48.3595 0 52.9142 1.91256 56.3293C3.26425 58.7429 5.25707 60.7357 7.67068 62.0874C11.0858 64 15.6405 64 24.75 64H39.25C48.3595 64 52.9142 64 56.3293 62.0874C58.7429 60.7357 60.7357 58.7429 62.0874 56.3293C64 52.9142 64 48.3595 64 39.25V24.75C64 15.6405 64 11.0858 62.0874 7.67068C60.7357 5.25706 58.7429 3.26425 56.3293 1.91256C52.9142 0 48.3595 0 39.25 0H24.75C15.6405 0 11.0858 0 7.67068 1.91256C5.25707 3.26425 3.26425 5.25706 1.91256 7.67068ZM22.5078 21.2734C22.9115 21.6641 23.4062 21.8594 23.9922 21.8594H50.418C50.9909 21.8594 51.4792 21.6641 51.8828 21.2734C52.2865 20.8698 52.4883 20.375 52.4883 19.7891C52.4883 19.2161 52.2865 18.7279 51.8828 18.3242C51.4792 17.9206 50.9909 17.7188 50.418 17.7188H23.9922C23.4062 17.7188 22.9115 17.9206 22.5078 18.3242C22.1172 18.7279 21.9219 19.2161 21.9219 19.7891C21.9219 20.375 22.1172 20.8698 22.5078 21.2734ZM22.5078 33.3828C22.9115 33.7865 23.4062 33.9883 23.9922 33.9883H50.418C50.9909 33.9883 51.4792 33.793 51.8828 33.4023C52.2865 32.9987 52.4883 32.5039 52.4883 31.918C52.4883 31.3451 52.2865 30.8633 51.8828 30.4727C51.4792 30.069 50.9909 29.8672 50.418 29.8672H23.9922C23.4062 29.8672 22.9115 30.069 22.5078 30.4727C22.1172 30.8633 21.9219 31.3451 21.9219 31.918C21.9219 32.4909 22.1172 32.9792 22.5078 33.3828ZM22.5078 45.5312C22.9115 45.9219 23.4062 46.1172 23.9922 46.1172H50.418C50.9909 46.1172 51.4792 45.9219 51.8828 45.5312C52.2865 45.1276 52.4883 44.6328 52.4883 44.0469C52.4883 43.474 52.2865 42.9857 51.8828 42.582C51.4792 42.1784 50.9909 41.9766 50.418 41.9766H23.9922C23.4062 41.9766 22.9115 42.1784 22.5078 42.582C22.1172 42.9857 21.9219 43.474 21.9219 44.0469C21.9219 44.6328 22.1172 45.1276 22.5078 45.5312ZM12.3711 21.8789C12.957 22.4518 13.6602 22.7383 14.4805 22.7383C15.2878 22.7383 15.9844 22.4518 16.5703 21.8789C17.1562 21.306 17.4492 20.6094 17.4492 19.7891C17.4492 18.9688 17.1562 18.2721 16.5703 17.6992C15.9844 17.1263 15.2878 16.8398 14.4805 16.8398C13.6602 16.8398 12.957 17.1263 12.3711 17.6992C11.7982 18.2721 11.5117 18.9688 11.5117 19.7891C11.5117 20.6094 11.7982 21.306 12.3711 21.8789ZM12.3711 34.0078C12.957 34.5938 13.6602 34.8867 14.4805 34.8867C15.2878 34.8867 15.9844 34.5938 16.5703 34.0078C17.1562 33.4219 17.4492 32.7253 17.4492 31.918C17.4492 31.1107 17.1562 30.4141 16.5703 29.8281C15.9844 29.2422 15.2878 28.9492 14.4805 28.9492C13.6602 28.9492 12.957 29.2422 12.3711 29.8281C11.7982 30.4141 11.5117 31.1107 11.5117 31.918C11.5117 32.7253 11.7982 33.4219 12.3711 34.0078ZM12.3711 46.1367C12.957 46.7227 13.6602 47.0156 14.4805 47.0156C15.2878 47.0156 15.9844 46.7227 16.5703 46.1367C17.1562 45.5638 17.4492 44.8672 17.4492 44.0469C17.4492 43.2266 17.1562 42.5299 16.5703 41.957C15.9844 41.3841 15.2878 41.0977 14.4805 41.0977C13.6602 41.0977 12.957 41.3841 12.3711 41.957C11.7982 42.5299 11.5117 43.2266 11.5117 44.0469C11.5117 44.8672 11.7982 45.5638 12.3711 46.1367Z",
		fill: "currentColor"
	})
});
const ForwardRef$17 = forwardRef(SvgPlaylistOn);
//#endregion
//#region src/components/ToggleIconButton/prebuilt-enum.ts
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
let PrebuiltToggleIconButtonType = /* @__PURE__ */ function(PrebuiltToggleIconButtonType) {
	PrebuiltToggleIconButtonType["Lyrics"] = "lyrics";
	PrebuiltToggleIconButtonType["Playlist"] = "playlist";
	PrebuiltToggleIconButtonType["Repeat"] = "repeat";
	PrebuiltToggleIconButtonType["Shuffle"] = "shuffle";
	PrebuiltToggleIconButtonType["Star"] = "star";
	PrebuiltToggleIconButtonType["AirPlay"] = "airplay";
	return PrebuiltToggleIconButtonType;
}({});
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/repeat_off.svg
const SvgRepeatOff = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 56,
	height: 56,
	viewBox: "0 0 56 56",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M13.0293 28.9805C12.4727 28.9805 12.0039 28.79 11.623 28.4092C11.2422 28.0186 11.0518 27.5498 11.0518 27.0029V25.3623C11.0518 23.7998 11.4033 22.457 12.1064 21.334C12.8096 20.2109 13.8057 19.3516 15.0947 18.7559C16.3838 18.1504 17.9219 17.8477 19.709 17.8477H30.6367V14.7422C30.6367 14.2832 30.7637 13.9268 31.0176 13.6729C31.2715 13.4092 31.623 13.2773 32.0723 13.2773C32.2871 13.2773 32.4775 13.3115 32.6436 13.3799C32.8193 13.4482 32.9805 13.541 33.127 13.6582L39.2354 18.8145C39.5869 19.0977 39.7578 19.4443 39.748 19.8545C39.748 20.2549 39.5771 20.5967 39.2354 20.8799L33.127 26.0361C32.9805 26.1533 32.8193 26.2461 32.6436 26.3145C32.4775 26.3828 32.2871 26.417 32.0723 26.417C31.623 26.417 31.2715 26.29 31.0176 26.0361C30.7637 25.7725 30.6367 25.416 30.6367 24.9668V21.6855H19.4893C18.1025 21.6855 17.0039 22.0615 16.1934 22.8135C15.3926 23.5557 14.9922 24.5713 14.9922 25.8604V27.0029C14.9922 27.5498 14.8018 28.0186 14.4209 28.4092C14.04 28.79 13.5762 28.9805 13.0293 28.9805ZM42.9707 26.959C43.5176 26.959 43.9814 27.1494 44.3623 27.5303C44.7529 27.9111 44.9482 28.3799 44.9482 28.9365V30.5771C44.9482 32.1299 44.5967 33.4727 43.8936 34.6055C43.1904 35.7285 42.1895 36.5928 40.8906 37.1982C39.6016 37.7939 38.0684 38.0918 36.291 38.0918H25.3633V41.1973C25.3633 41.6465 25.2363 41.998 24.9824 42.252C24.7285 42.5156 24.377 42.6475 23.9277 42.6475C23.7129 42.6475 23.5176 42.6133 23.3418 42.5449C23.166 42.4766 23.0098 42.3838 22.873 42.2666L16.75 37.1104C16.418 36.8271 16.252 36.4854 16.252 36.085C16.252 35.6846 16.418 35.3379 16.75 35.0449L22.873 29.8887C23.0098 29.7715 23.166 29.6787 23.3418 29.6104C23.5176 29.542 23.7129 29.5078 23.9277 29.5078C24.377 29.5078 24.7285 29.6396 24.9824 29.9033C25.2363 30.1572 25.3633 30.5137 25.3633 30.9727V34.2393H36.5107C37.8975 34.2393 38.9912 33.8682 39.792 33.126C40.6025 32.3838 41.0078 31.3682 41.0078 30.0791V28.9365C41.0078 28.3799 41.1934 27.9111 41.5645 27.5303C41.9453 27.1494 42.4141 26.959 42.9707 26.959Z",
		fill: "currentColor"
	})
});
const ForwardRef$16 = forwardRef(SvgRepeatOff);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/repeat_on_normal.svg
const SvgRepeatOnNormal = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 56,
	height: 56,
	viewBox: "0 0 56 56",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M1.65755 6.64792C0 9.6077 0 13.5551 0 21.45V34.55C0 42.4449 0 46.3923 1.65755 49.3521C2.82902 51.4439 4.55612 53.171 6.64792 54.3424C9.6077 56 13.5551 56 21.45 56H34.55C42.4449 56 46.3923 56 49.3521 54.3424C51.4439 53.171 53.171 51.4439 54.3424 49.3521C56 46.3923 56 42.4449 56 34.55V21.45C56 13.5551 56 9.6077 54.3424 6.64792C53.171 4.55612 51.4439 2.82902 49.3521 1.65755C46.3923 0 42.4449 0 34.55 0H21.45C13.5551 0 9.6077 0 6.64792 1.65755C4.55612 2.82902 2.82902 4.55612 1.65755 6.64792ZM11.623 28.4092C12.0039 28.79 12.4727 28.9805 13.0293 28.9805C13.5762 28.9805 14.04 28.79 14.4209 28.4092C14.8018 28.0186 14.9922 27.5498 14.9922 27.0029V25.8604C14.9922 24.5713 15.3926 23.5557 16.1934 22.8135C17.0039 22.0615 18.1025 21.6855 19.4893 21.6855H30.6367V24.9668C30.6367 25.416 30.7637 25.7725 31.0176 26.0361C31.2715 26.29 31.623 26.417 32.0723 26.417C32.2871 26.417 32.4775 26.3828 32.6436 26.3145C32.8193 26.2461 32.9805 26.1533 33.127 26.0361L39.2354 20.8799C39.5771 20.5967 39.748 20.2549 39.748 19.8545C39.7578 19.4443 39.5869 19.0977 39.2354 18.8145L33.127 13.6582C32.9805 13.541 32.8193 13.4482 32.6436 13.3799C32.4775 13.3115 32.2871 13.2773 32.0723 13.2773C31.623 13.2773 31.2715 13.4092 31.0176 13.6729C30.7637 13.9268 30.6367 14.2832 30.6367 14.7422V17.8477H19.709C17.9219 17.8477 16.3838 18.1504 15.0947 18.7559C13.8057 19.3516 12.8096 20.2109 12.1064 21.334C11.4033 22.457 11.0518 23.7998 11.0518 25.3623V27.0029C11.0518 27.5498 11.2422 28.0186 11.623 28.4092ZM44.3623 27.5303C43.9814 27.1494 43.5176 26.959 42.9707 26.959C42.4141 26.959 41.9453 27.1494 41.5645 27.5303C41.1934 27.9111 41.0078 28.3799 41.0078 28.9365V30.0791C41.0078 31.3682 40.6025 32.3838 39.792 33.126C38.9912 33.8682 37.8975 34.2393 36.5107 34.2393H25.3633V30.9727C25.3633 30.5137 25.2363 30.1572 24.9824 29.9033C24.7285 29.6396 24.377 29.5078 23.9277 29.5078C23.7129 29.5078 23.5176 29.542 23.3418 29.6104C23.166 29.6787 23.0098 29.7715 22.873 29.8887L16.75 35.0449C16.418 35.3379 16.252 35.6846 16.252 36.085C16.252 36.4854 16.418 36.8271 16.75 37.1104L22.873 42.2666C23.0098 42.3838 23.166 42.4766 23.3418 42.5449C23.5176 42.6133 23.7129 42.6475 23.9277 42.6475C24.377 42.6475 24.7285 42.5156 24.9824 42.252C25.2363 41.998 25.3633 41.6465 25.3633 41.1973V38.0918H36.291C38.0684 38.0918 39.6016 37.7939 40.8906 37.1982C42.1895 36.5928 43.1904 35.7285 43.8936 34.6055C44.5967 33.4727 44.9482 32.1299 44.9482 30.5771V28.9365C44.9482 28.3799 44.7529 27.9111 44.3623 27.5303Z",
		fill: "currentColor"
	})
});
const ForwardRef$15 = forwardRef(SvgRepeatOnNormal);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/shuffle_off.svg
const SvgShuffleOff = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 56,
	height: 56,
	viewBox: "0 0 56 56",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M9.55762 36.7148C9.55762 36.1777 9.74316 35.7285 10.1143 35.3672C10.4951 35.0059 10.9639 34.8252 11.5205 34.8252H14.7285C15.6562 34.8252 16.4375 34.6592 17.0723 34.3271C17.707 33.9951 18.3369 33.4434 18.9619 32.6719L27.7656 21.8613C28.8008 20.5918 29.8457 19.7275 30.9004 19.2686C31.9551 18.7998 33.2051 18.5654 34.6504 18.5654H37.3311V15.1963C37.3311 14.7471 37.458 14.3955 37.7119 14.1416C37.9658 13.8779 38.3174 13.7461 38.7666 13.7461C38.9814 13.7461 39.1719 13.7803 39.3379 13.8486C39.5137 13.917 39.6748 14.0098 39.8213 14.127L45.9297 19.2832C46.2715 19.5664 46.4424 19.9131 46.4424 20.3232C46.4424 20.7236 46.2715 21.0654 45.9297 21.3486L39.8213 26.5049C39.6748 26.6221 39.5137 26.7148 39.3379 26.7832C39.1719 26.8516 38.9814 26.8857 38.7666 26.8857C38.3174 26.8857 37.9658 26.7588 37.7119 26.5049C37.458 26.2412 37.3311 25.8848 37.3311 25.4355V22.3447H34.4746C33.8496 22.3447 33.3076 22.4131 32.8486 22.5498C32.3896 22.6768 31.96 22.8965 31.5596 23.209C31.1689 23.5215 30.7588 23.9414 30.3291 24.4688L21.1006 35.748C20.2607 36.7539 19.3916 37.4814 18.4932 37.9307C17.5947 38.3701 16.4766 38.5898 15.1387 38.5898H11.5205C10.9639 38.5898 10.4951 38.4092 10.1143 38.0479C9.74316 37.6865 9.55762 37.2422 9.55762 36.7148ZM9.55762 20.4551C9.55762 19.918 9.74316 19.4688 10.1143 19.1074C10.4951 18.7461 10.9639 18.5654 11.5205 18.5654H14.8896C16.2178 18.5654 17.375 18.79 18.3613 19.2393C19.3477 19.6787 20.2607 20.4062 21.1006 21.4219L30.2998 32.6719C30.9248 33.4336 31.5742 33.9854 32.248 34.3271C32.9219 34.6592 33.7373 34.8252 34.6943 34.8252H37.3311V31.7344C37.3311 31.2852 37.458 30.9287 37.7119 30.665C37.9658 30.4014 38.3174 30.2695 38.7666 30.2695C38.9814 30.2695 39.1719 30.3086 39.3379 30.3867C39.5137 30.4551 39.6748 30.5479 39.8213 30.665L45.9297 35.8066C46.2715 36.0996 46.4424 36.4463 46.4424 36.8467C46.4424 37.2471 46.2715 37.5938 45.9297 37.8867L39.8213 43.0283C39.6748 43.1455 39.5137 43.2383 39.3379 43.3066C39.1719 43.375 38.9814 43.4092 38.7666 43.4092C38.3174 43.4092 37.9658 43.2822 37.7119 43.0283C37.458 42.7744 37.3311 42.418 37.3311 41.959V38.5898H34.6211C33.2832 38.5898 32.0723 38.3652 30.9883 37.916C29.9141 37.457 28.9229 36.6758 28.0146 35.5723L18.9619 24.498C18.3369 23.7266 17.6631 23.1748 16.9404 22.8428C16.2275 22.5107 15.4023 22.3447 14.4648 22.3447H11.5205C10.9639 22.3447 10.4951 22.1641 10.1143 21.8027C9.74316 21.4316 9.55762 20.9824 9.55762 20.4551Z",
		fill: "currentColor"
	})
});
const ForwardRef$14 = forwardRef(SvgShuffleOff);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/shuffle_on.svg
const SvgShuffleOn = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 56,
	height: 56,
	viewBox: "0 0 56 56",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M1.65755 6.64792C0 9.6077 0 13.5551 0 21.45V34.55C0 42.4449 0 46.3923 1.65755 49.3521C2.82902 51.4439 4.55612 53.171 6.64792 54.3424C9.6077 56 13.5551 56 21.45 56H34.55C42.4449 56 46.3923 56 49.3521 54.3424C51.4439 53.171 53.171 51.4439 54.3424 49.3521C56 46.3923 56 42.4449 56 34.55V21.45C56 13.5551 56 9.6077 54.3424 6.64792C53.171 4.55612 51.4439 2.82902 49.3521 1.65755C46.3923 0 42.4449 0 34.55 0H21.45C13.5551 0 9.6077 0 6.64792 1.65755C4.55612 2.82902 2.82902 4.55612 1.65755 6.64792ZM10.1143 35.3672C9.74316 35.7285 9.55762 36.1777 9.55762 36.7148C9.55762 37.2422 9.74316 37.6865 10.1143 38.0479C10.4951 38.4092 10.9639 38.5898 11.5205 38.5898H15.1387C16.4766 38.5898 17.5947 38.3701 18.4932 37.9307C19.3916 37.4814 20.2607 36.7539 21.1006 35.748L24.631 31.4331L28.0146 35.5723C28.9229 36.6758 29.9141 37.457 30.9883 37.916C32.0723 38.3652 33.2832 38.5898 34.6211 38.5898H37.3311V41.959C37.3311 42.418 37.458 42.7744 37.7119 43.0283C37.9658 43.2822 38.3174 43.4092 38.7666 43.4092C38.9814 43.4092 39.1719 43.375 39.3379 43.3066C39.5137 43.2383 39.6748 43.1455 39.8213 43.0283L45.9297 37.8867C46.2715 37.5938 46.4424 37.2471 46.4424 36.8467C46.4424 36.4463 46.2715 36.0996 45.9297 35.8066L39.8213 30.665C39.6748 30.5479 39.5137 30.4551 39.3379 30.3867C39.1719 30.3086 38.9814 30.2695 38.7666 30.2695C38.3174 30.2695 37.9658 30.4014 37.7119 30.665C37.458 30.9287 37.3311 31.2852 37.3311 31.7344V34.8252H34.6943C33.7373 34.8252 32.9219 34.6592 32.248 34.3271C31.5742 33.9854 30.9248 33.4336 30.2998 32.6719L26.9596 28.587L30.3291 24.4688C30.7588 23.9414 31.1689 23.5215 31.5596 23.209C31.96 22.8965 32.3896 22.6768 32.8486 22.5498C33.3076 22.4131 33.8496 22.3447 34.4746 22.3447H37.3311V25.4355C37.3311 25.8848 37.458 26.2412 37.7119 26.5049C37.9658 26.7588 38.3174 26.8857 38.7666 26.8857C38.9814 26.8857 39.1719 26.8516 39.3379 26.7832C39.5137 26.7148 39.6748 26.6221 39.8213 26.5049L45.9297 21.3486C46.2715 21.0654 46.4424 20.7236 46.4424 20.3232C46.4424 19.9131 46.2715 19.5664 45.9297 19.2832L39.8213 14.127C39.6748 14.0098 39.5137 13.917 39.3379 13.8486C39.1719 13.7803 38.9814 13.7461 38.7666 13.7461C38.3174 13.7461 37.9658 13.8779 37.7119 14.1416C37.458 14.3955 37.3311 14.7471 37.3311 15.1963V18.5654H34.6504C33.2051 18.5654 31.9551 18.7998 30.9004 19.2686C29.8457 19.7275 28.8008 20.5918 27.7656 21.8613L24.6192 25.7249L21.1006 21.4219C20.2607 20.4062 19.3477 19.6787 18.3613 19.2393C17.375 18.79 16.2178 18.5654 14.8896 18.5654H11.5205C10.9639 18.5654 10.4951 18.7461 10.1143 19.1074C9.74316 19.4688 9.55762 19.918 9.55762 20.4551C9.55762 20.9824 9.74316 21.4316 10.1143 21.8027C10.4951 22.1641 10.9639 22.3447 11.5205 22.3447H14.4648C15.4023 22.3447 16.2275 22.5107 16.9404 22.8428C17.6631 23.1748 18.3369 23.7266 18.9619 24.498L22.2965 28.5772L18.9619 32.6719C18.3369 33.4434 17.707 33.9951 17.0723 34.3271C16.4375 34.6592 15.6562 34.8252 14.7285 34.8252H11.5205C10.9639 34.8252 10.4951 35.0059 10.1143 35.3672Z",
		fill: "currentColor"
	})
});
const ForwardRef$13 = forwardRef(SvgShuffleOn);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/star.svg
const SvgStar = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 36,
	height: 36,
	viewBox: "0 0 36 36",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M7.83396 32.7793C7.49216 32.5254 7.2822 32.1836 7.20407 31.7539C7.13571 31.334 7.19919 30.8359 7.3945 30.2598L10.4121 21.3096L2.72165 15.7871C2.2236 15.4355 1.87692 15.0693 1.68161 14.6885C1.4863 14.2979 1.457 13.8975 1.59372 13.4873C1.73044 13.0869 1.98923 12.7891 2.37009 12.5938C2.75095 12.3887 3.24899 12.291 3.86423 12.3008L13.2832 12.3594L16.1543 3.36523C16.3398 2.7793 16.584 2.33496 16.8867 2.03223C17.1992 1.71973 17.5654 1.56348 17.9853 1.56348C18.415 1.56348 18.7812 1.71973 19.084 2.03223C19.3965 2.33496 19.6455 2.7793 19.831 3.36523L22.7021 12.3594L32.1211 12.3008C32.7363 12.291 33.2343 12.3887 33.6152 12.5938C33.9961 12.7891 34.2549 13.0869 34.3916 13.4873C34.5283 13.8975 34.499 14.2979 34.3037 14.6885C34.1084 15.0693 33.7617 15.4355 33.2636 15.7871L25.5732 21.3096L28.5908 30.2598C28.7861 30.8359 28.8447 31.334 28.7666 31.7539C28.6982 32.1836 28.4931 32.5254 28.1513 32.7793C27.8095 33.0527 27.4238 33.1504 26.9941 33.0723C26.5644 32.9941 26.1054 32.7793 25.6172 32.4277L17.9853 26.8174L10.3681 32.4277C9.87985 32.7793 9.42087 32.9941 8.99118 33.0723C8.56149 33.1504 8.17575 33.0527 7.83396 32.7793ZM10.4121 29.2344C10.4316 29.2637 10.4707 29.2588 10.5293 29.2197L17.1357 24.1221C17.4287 23.8877 17.7119 23.7705 17.9853 23.7705C18.2685 23.7705 18.5566 23.8877 18.8496 24.1221L25.456 29.2197C25.5146 29.2588 25.5537 29.2637 25.5732 29.2344C25.583 29.2148 25.583 29.1758 25.5732 29.1172L22.79 21.2656C22.7119 21.0312 22.6679 20.8213 22.6582 20.6357C22.6582 20.4404 22.707 20.2646 22.8047 20.1084C22.9121 19.9521 23.0732 19.8008 23.2881 19.6543L30.1728 14.9521C30.2314 14.9131 30.2558 14.874 30.2461 14.835C30.2363 14.8057 30.1924 14.791 30.1142 14.791L21.7939 14.9961C21.4131 15.0059 21.1152 14.9424 20.9004 14.8057C20.6855 14.6592 20.5244 14.3955 20.417 14.0146L18.0732 6.03125C18.0537 5.96289 18.0244 5.92871 17.9853 5.92871C17.956 5.92871 17.9316 5.96289 17.9121 6.03125L15.5683 14.0146C15.4609 14.3955 15.2998 14.6592 15.0849 14.8057C14.8701 14.9424 14.5722 15.0059 14.1914 14.9961L5.87107 14.791C5.79294 14.791 5.74899 14.8057 5.73923 14.835C5.72946 14.874 5.75388 14.9131 5.81247 14.9521L12.6972 19.6543C12.9121 19.8008 13.0683 19.9521 13.166 20.1084C13.2734 20.2646 13.3222 20.4404 13.3125 20.6357C13.3125 20.8213 13.2734 21.0312 13.1953 21.2656L10.4121 29.1172C10.3925 29.1758 10.3925 29.2148 10.4121 29.2344Z",
		fill: "currentColor"
	})
});
const ForwardRef$12 = forwardRef(SvgStar);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/ToggleIconButton/star_filled.svg
const SvgStarFilled = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 36,
	height: 36,
	viewBox: "0 0 36 36",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M7.83396 32.7793C7.49216 32.5254 7.2822 32.1836 7.20407 31.7539C7.13571 31.334 7.19919 30.8359 7.3945 30.2598L10.4121 21.3096L2.72165 15.7871C2.2236 15.4355 1.87692 15.0693 1.68161 14.6885C1.4863 14.2979 1.457 13.8975 1.59372 13.4873C1.73044 13.0869 1.98923 12.7891 2.37009 12.5938C2.75095 12.3984 3.24899 12.3008 3.86423 12.3008H13.2832L16.1543 3.36523C16.3398 2.7793 16.584 2.33496 16.8867 2.03223C17.1992 1.71973 17.5654 1.56348 17.9853 1.56348C18.415 1.56348 18.7812 1.71973 19.084 2.03223C19.3965 2.33496 19.6455 2.7793 19.831 3.36523L22.7021 12.3008H32.1211C32.7363 12.3008 33.2343 12.3984 33.6152 12.5938C33.9961 12.7891 34.2549 13.0869 34.3916 13.4873C34.5283 13.8975 34.499 14.2979 34.3037 14.6885C34.1084 15.0693 33.7617 15.4355 33.2636 15.7871L25.5732 21.3096L28.5908 30.2598C28.7861 30.8359 28.8447 31.334 28.7666 31.7539C28.6982 32.1836 28.4931 32.5254 28.1513 32.7793C27.8095 33.0527 27.4238 33.1504 26.9941 33.0723C26.5644 32.9941 26.1054 32.7793 25.6172 32.4277L17.9853 26.8174L10.3681 32.4277C9.87985 32.7793 9.42087 32.9941 8.99118 33.0723C8.56149 33.1504 8.17575 33.0527 7.83396 32.7793Z",
		fill: "currentColor"
	})
});
const ForwardRef$11 = forwardRef(SvgStarFilled);
//#endregion
//#region src/components/ToggleIconButton/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const ToggleIconButton = memo((t0) => {
	const $ = c(12);
	let checked;
	let checkedIcon;
	let className;
	let rest;
	let uncheckedIcon;
	if ($[0] !== t0) {
		({uncheckedIcon, checkedIcon, checked, className, ...rest} = t0);
		$[0] = t0;
		$[1] = checked;
		$[2] = checkedIcon;
		$[3] = className;
		$[4] = rest;
		$[5] = uncheckedIcon;
	} else {
		checked = $[1];
		checkedIcon = $[2];
		className = $[3];
		rest = $[4];
		uncheckedIcon = $[5];
	}
	let t1;
	if ($[6] !== className) {
		t1 = classnames(className, index_module_default$2.toggleIconButton);
		$[6] = className;
		$[7] = t1;
	} else t1 = $[7];
	const t2 = checked ? checkedIcon : uncheckedIcon;
	let t3;
	if ($[8] !== rest || $[9] !== t1 || $[10] !== t2) {
		t3 = /* @__PURE__ */ jsx("button", {
			className: t1,
			type: "button",
			...rest,
			children: t2
		});
		$[8] = rest;
		$[9] = t1;
		$[10] = t2;
		$[11] = t3;
	} else t3 = $[11];
	return t3;
});
const PREBUILT_ICONS_MAP = {
	["lyrics"]: [ForwardRef$20, ForwardRef$19],
	["playlist"]: [ForwardRef$18, ForwardRef$17],
	["repeat"]: [ForwardRef$16, ForwardRef$15],
	["shuffle"]: [ForwardRef$14, ForwardRef$13],
	["star"]: [ForwardRef$12, ForwardRef$11],
	["airplay"]: [ForwardRef$21, ForwardRef$21]
};
const PrebuiltToggleIconButton = memo((t0) => {
	const $ = c(15);
	let checked;
	let onClick;
	let rest;
	let type;
	if ($[0] !== t0) {
		({type, checked, onClick, ...rest} = t0);
		$[0] = t0;
		$[1] = checked;
		$[2] = onClick;
		$[3] = rest;
		$[4] = type;
	} else {
		checked = $[1];
		onClick = $[2];
		rest = $[3];
		type = $[4];
	}
	const [UncheckedIcon, CheckedIcon] = PREBUILT_ICONS_MAP[type];
	let t1;
	if ($[5] !== UncheckedIcon) {
		t1 = /* @__PURE__ */ jsx(UncheckedIcon, {});
		$[5] = UncheckedIcon;
		$[6] = t1;
	} else t1 = $[6];
	let t2;
	if ($[7] !== CheckedIcon) {
		t2 = /* @__PURE__ */ jsx(CheckedIcon, {});
		$[7] = CheckedIcon;
		$[8] = t2;
	} else t2 = $[8];
	const t3 = checked ?? false;
	let t4;
	if ($[9] !== onClick || $[10] !== rest || $[11] !== t1 || $[12] !== t2 || $[13] !== t3) {
		t4 = /* @__PURE__ */ jsx(ToggleIconButton, {
			uncheckedIcon: t1,
			checkedIcon: t2,
			checked: t3,
			onClick,
			...rest
		});
		$[9] = onClick;
		$[10] = rest;
		$[11] = t1;
		$[12] = t2;
		$[13] = t3;
		$[14] = t4;
	} else t4 = $[14];
	return t4;
});
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/VolumeControlSlider/icon_speaker.svg
const SvgIconSpeaker = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 32,
	height: 40,
	viewBox: "0 0 32 40",
	fill: "currentColor",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M14.9042 27.1802C14.4202 27.1802 14.0473 26.9897 13.595 26.5612L10.3815 23.5461C10.3339 23.5065 10.2863 23.4906 10.2228 23.4906H8.01703C6.70778 23.4906 5.99365 22.7527 5.99365 21.38V18.4442C5.99365 17.0715 6.70778 16.3257 8.01703 16.3257H10.2307C10.2863 16.3257 10.3418 16.3019 10.3815 16.2622L13.595 13.2709C14.079 12.8107 14.4361 12.6282 14.8883 12.6282C15.6104 12.6282 16.142 13.1915 16.142 13.8977V25.9344C16.142 26.6406 15.6104 27.1802 14.9042 27.1802Z",
		className: "speaker-bounce-1"
	})
});
const ForwardRef$10 = forwardRef(SvgIconSpeaker);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/VolumeControlSlider/icon_speaker_3.svg
const SvgIconSpeaker3 = (props, ref) => /* @__PURE__ */ jsxs("svg", {
	width: 43,
	height: 40,
	viewBox: "0 0 43 40",
	fill: "currentColor",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: [
		/* @__PURE__ */ jsx("path", {
			d: "M24.0403 27.1802C23.5642 27.1802 23.1913 26.9897 22.739 26.5612L19.5176 23.5461C19.4779 23.5065 19.4224 23.4906 19.3668 23.4906H17.161C15.8518 23.4906 15.1377 22.7527 15.1377 21.38V18.4442C15.1377 17.0715 15.8518 16.3257 17.161 16.3257H19.3668C19.4303 16.3257 19.4779 16.3019 19.5255 16.2622L22.739 13.2709C23.223 12.8107 23.5721 12.6282 24.0324 12.6282C24.7544 12.6282 25.286 13.1915 25.286 13.8977V25.9344C25.286 26.6406 24.7544 27.1802 24.0403 27.1802Z",
			className: "speaker-bounce-1"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M28.0948 23.6653C27.6028 23.3559 27.4996 22.7687 27.8964 22.1101C28.2931 21.4991 28.5232 20.7136 28.5232 19.8964C28.5232 19.0712 28.301 18.2856 27.8964 17.6826C27.4917 17.032 27.6028 16.4369 28.0948 16.1274C28.547 15.8418 29.1104 15.9529 29.404 16.3576C30.0863 17.3097 30.491 18.5713 30.491 19.8964C30.491 21.2214 30.0863 22.4831 29.404 23.4273C29.1104 23.8399 28.547 23.943 28.0948 23.6653Z",
			className: "speaker-bounce-2"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M31.6733 25.8711C31.1576 25.5696 31.0942 24.9428 31.4432 24.3794C32.2526 23.1257 32.7207 21.5468 32.7207 19.8964C32.7207 18.2459 32.2605 16.6591 31.4432 15.4133C31.0942 14.8499 31.1576 14.2231 31.6733 13.9137C32.1415 13.6439 32.7128 13.755 33.0143 14.2152C34.0855 15.7783 34.6885 17.8016 34.6885 19.8964C34.6885 21.9911 34.0775 23.9985 33.0143 25.5775C32.7128 26.0377 32.1415 26.1488 31.6733 25.8711Z",
			className: "speaker-bounce-3"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M35.2362 28.1007C34.7363 27.7992 34.6569 27.1803 34.9981 26.6249C36.1883 24.7286 36.9104 22.4196 36.9104 19.9122C36.9104 17.397 36.1883 15.0881 34.9981 13.1917C34.6569 12.6362 34.7363 12.0174 35.2362 11.7159C35.7123 11.4302 36.3073 11.5651 36.6088 12.0571C38.0133 14.2866 38.8702 16.9765 38.8702 19.9122C38.8702 22.8401 38.0291 25.5379 36.6088 27.7675C36.3073 28.2515 35.7123 28.3864 35.2362 28.1007Z",
			className: "speaker-bounce-4"
		})
	]
});
const ForwardRef$9 = forwardRef(SvgIconSpeaker3);
//#endregion
//#region src/components/VolumeControlSlider/index.module.css
var index_module_default$1 = {
	"speaker-bounce-part1": "_38r6iG_speaker-bounce-part1",
	"speaker-bounce-part2": "_38r6iG_speaker-bounce-part2",
	"speaker-bounce-part3": "_38r6iG_speaker-bounce-part3",
	"speakerAnimate": "_38r6iG_speakerAnimate",
	"volumeControl": "_38r6iG_volumeControl"
};
//#endregion
//#region src/components/VolumeControlSlider/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const VolumeControl = (props) => {
	const $ = c(9);
	const lastValueRef = useRef(props.value);
	const minSpeakerRef = useRef(null);
	const maxSpeakerRef = useRef(null);
	let t0;
	let t1;
	if ($[0] !== props.max || $[1] !== props.min || $[2] !== props.value) {
		t0 = () => {
			if (lastValueRef.current !== props.value) {
				lastValueRef.current = props.value;
				if (props.value <= props.min && minSpeakerRef.current) {
					minSpeakerRef.current.classList.remove(index_module_default$1.speakerAnimate);
					requestAnimationFrame(() => {
						minSpeakerRef.current?.classList?.add(index_module_default$1.speakerAnimate);
					});
				} else if (props.value >= props.max && maxSpeakerRef.current) {
					maxSpeakerRef.current.classList.remove(index_module_default$1.speakerAnimate);
					requestAnimationFrame(() => {
						maxSpeakerRef.current?.classList?.add(index_module_default$1.speakerAnimate);
					});
				}
			}
		};
		t1 = [
			props.value,
			props.min,
			props.max
		];
		$[0] = props.max;
		$[1] = props.min;
		$[2] = props.value;
		$[3] = t0;
		$[4] = t1;
	} else {
		t0 = $[3];
		t1 = $[4];
	}
	useEffect(t0, t1);
	let t2;
	let t3;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ jsx(ForwardRef$10, {
			ref: minSpeakerRef,
			color: "#FFFFFF"
		});
		t3 = /* @__PURE__ */ jsx(ForwardRef$9, {
			ref: maxSpeakerRef,
			color: "#FFFFFF"
		});
		$[5] = t2;
		$[6] = t3;
	} else {
		t2 = $[5];
		t3 = $[6];
	}
	let t4;
	if ($[7] !== props) {
		t4 = /* @__PURE__ */ jsx(BouncingSlider, {
			className: index_module_default$1.volumeControl,
			beforeIcon: t2,
			afterIcon: t3,
			changeOnDrag: true,
			...props
		});
		$[7] = props;
		$[8] = t4;
	} else t4 = $[8];
	return t4;
};
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/PrebuiltLyricPlayer/icon_forward.svg
const SvgIconForward = (props, ref) => /* @__PURE__ */ jsxs("svg", {
	id: "vector",
	xmlns: "http://www.w3.org/2000/svg",
	width: 32,
	height: 32,
	viewBox: "0 0 134 134",
	fill: "currentColor",
	ref,
	...props,
	children: [
		/* @__PURE__ */ jsx("path", {
			d: "M62 60.0717C65.938 62.3453 67.9069 63.4821 68.5677 64.9662C69.1441 66.2608 69.1441 67.7391 68.5677 69.0336C67.9069 70.5177 65.938 71.6545 62 73.9281L41 86.0525C37.062 88.326 35.0931 89.4628 33.4774 89.293C32.0681 89.1449 30.7878 88.4057 29.9549 87.2593C29 85.945 29 83.6714 29 79.1243V54.8755C29 50.3284 29 48.0548 29.9549 46.7405C30.7878 45.5941 32.0681 44.8549 33.4774 44.7068C35.0931 44.537 37.062 45.6738 41 47.9473L62 60.0717Z",
			className: "amll-forward-left-arrow"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M62 60.0717C65.938 62.3453 67.9069 63.4821 68.5677 64.9662C69.1441 66.2608 69.1441 67.7391 68.5677 69.0336C67.9069 70.5177 65.938 71.6545 62 73.9281L41 86.0525C37.062 88.326 35.0931 89.4628 33.4774 89.293C32.0681 89.1449 30.7878 88.4057 29.9549 87.2593C29 85.945 29 83.6714 29 79.1243V54.8755C29 50.3284 29 48.0548 29.9549 46.7405C30.7878 45.5941 32.0681 44.8549 33.4774 44.7068C35.0931 44.537 37.062 45.6738 41 47.9473L62 60.0717Z",
			className: "amll-forward-left-standby"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M102 60.0717C105.938 62.3453 107.907 63.4821 108.568 64.9662C109.144 66.2608 109.144 67.7391 108.568 69.0336C107.907 70.5177 105.938 71.6545 102 73.9281L81 86.0525C77.062 88.326 75.0931 89.4628 73.4774 89.293C72.0681 89.1449 70.7878 88.4057 69.9549 87.2593C69 85.945 69 83.6714 69 79.1243V54.8755C69 50.3284 69 48.0548 69.9549 46.7405C70.7878 45.5941 72.0681 44.8549 73.4774 44.7068C75.0931 44.537 77.062 45.6738 81 47.9473L102 60.0717Z",
			className: "amll-forward-right-arrow"
		})
	]
});
const ForwardRef$8 = forwardRef(SvgIconForward);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/PrebuiltLyricPlayer/icon_pause.svg
const SvgIconPause = (props, ref) => /* @__PURE__ */ jsx("svg", {
	id: "vector",
	width: 38,
	height: 38,
	viewBox: "0 0 38 38",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M8.46953 37C7.37801 37 6.56603 36.7271 6.03359 36.1814C5.51445 35.6489 5.25488 34.8502 5.25488 33.7854V4.21464C5.25488 3.14975 5.52111 2.35108 6.05355 1.81864C6.59931 1.27288 7.40463 1 8.46953 1H13.3813C14.4329 1 15.2249 1.27288 15.7574 1.81864C16.3031 2.35108 16.576 3.14975 16.576 4.21464V33.7854C16.576 34.8502 16.3031 35.6489 15.7574 36.1814C15.2249 36.7271 14.4329 37 13.3813 37H8.46953ZM24.6426 37C23.5644 37 22.759 36.7271 22.2266 36.1814C21.6942 35.6489 21.4279 34.8502 21.4279 33.7854V4.21464C21.4279 3.14975 21.6942 2.35108 22.2266 1.81864C22.7724 1.27288 23.5777 1 24.6426 1H29.5544C30.6193 1 31.4179 1.27288 31.9504 1.81864C32.4828 2.35108 32.7491 3.14975 32.7491 4.21464V33.7854C32.7491 34.8502 32.4828 35.6489 31.9504 36.1814C31.4179 36.7271 30.6193 37 29.5544 37H24.6426Z",
		fill: "currentColor",
		fillRule: "nonzero",
		id: "path_0"
	})
});
const ForwardRef$7 = forwardRef(SvgIconPause);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/PrebuiltLyricPlayer/icon_play.svg
const SvgIconPlay = (props, ref) => /* @__PURE__ */ jsx("svg", {
	id: "vector",
	width: 38,
	height: 38,
	viewBox: "0 0 38 38",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M5.80762 32.4896V5.4925C5.80762 4.305 6.12305 3.41438 6.75391 2.82063C7.38477 2.22688 8.13932 1.93 9.01758 1.93C9.78451 1.93 10.5391 2.14029 11.2812 2.56086L33.7324 15.6605C34.5859 16.1553 35.223 16.6562 35.6436 17.1634C36.0641 17.6582 36.2744 18.2705 36.2744 19.0003C36.2744 19.7054 36.0641 20.3177 35.6436 20.8372C35.223 21.3444 34.5859 21.8392 33.7324 22.3216L11.2812 35.4212C10.5391 35.8542 9.78451 36.0706 9.01758 36.0706C8.13932 36.0706 7.38477 35.7676 6.75391 35.1614C6.12305 34.5677 5.80762 33.6771 5.80762 32.4896Z",
		fill: "currentColor",
		fillRule: "nonzero"
	})
});
const ForwardRef$6 = forwardRef(SvgIconPlay);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/PrebuiltLyricPlayer/icon_rewind.svg
const SvgIconRewind = (props, ref) => /* @__PURE__ */ jsxs("svg", {
	id: "vector",
	xmlns: "http://www.w3.org/2000/svg",
	width: 32,
	height: 32,
	viewBox: "0 0 134 134",
	fill: "currentColor",
	ref,
	...props,
	children: [
		/* @__PURE__ */ jsx("path", {
			d: "M72 60.0717C68.062 62.3453 66.0931 63.4821 65.4323 64.9662C64.8559 66.2608 64.8559 67.7391 65.4323 69.0336C66.0931 70.5177 68.062 71.6545 72 73.9281L93 86.0525C96.938 88.326 98.9069 89.4628 100.523 89.293C101.932 89.1449 103.212 88.4057 104.045 87.2593C105 85.945 105 83.6714 105 79.1243V54.8755C105 50.3284 105 48.0548 104.045 46.7405C103.212 45.5941 101.932 44.8549 100.523 44.7068C98.9069 44.537 96.938 45.6738 93 47.9473L72 60.0717Z",
			className: "amll-rewind-right-arrow"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M72 60.0717C68.062 62.3453 66.0931 63.4821 65.4323 64.9662C64.8559 66.2608 64.8559 67.7391 65.4323 69.0336C66.0931 70.5177 68.062 71.6545 72 73.9281L93 86.0525C96.938 88.326 98.9069 89.4628 100.523 89.293C101.932 89.1449 103.212 88.4057 104.045 87.2593C105 85.945 105 83.6714 105 79.1243V54.8755C105 50.3284 105 48.0548 104.045 46.7405C103.212 45.5941 101.932 44.8549 100.523 44.7068C98.9069 44.537 96.938 45.6738 93 47.9473L72 60.0717Z",
			className: "amll-rewind-right-standby"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M32 60.0717C28.062 62.3453 26.0931 63.4821 25.4323 64.9662C24.8559 66.2608 24.8559 67.7391 25.4323 69.0336C26.0931 70.5177 28.062 71.6545 32 73.9281L53 86.0525C56.938 88.326 58.9069 89.4628 60.5226 89.293C61.9319 89.1449 63.2122 88.4057 64.0451 87.2593C65 85.945 65 83.6714 65 79.1243V54.8755C65 50.3284 65 48.0548 64.0451 46.7405C63.2122 45.5941 61.9319 44.8549 60.5226 44.7068C58.9069 44.537 56.938 45.6738 53 47.9473L32 60.0717Z",
			className: "amll-rewind-left-arrow"
		})
	]
});
const ForwardRef$5 = forwardRef(SvgIconRewind);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/PrebuiltLyricPlayer/repeat.svg
const SvgRepeat = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 56,
	height: 56,
	viewBox: "0 0 56 56",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M14.2495 28.9956C13.6519 28.9956 13.1465 28.7891 12.7334 28.376C12.3203 27.9541 12.1138 27.4531 12.1138 26.873V25.3438C12.1138 23.832 12.4565 22.5312 13.1421 21.4414C13.8276 20.3516 14.8076 19.5166 16.082 18.9365C17.3564 18.3477 18.877 18.0532 20.6436 18.0532H30.3599V15.4033C30.3599 14.9111 30.4961 14.5288 30.7686 14.2563C31.041 13.9751 31.4146 13.8345 31.8892 13.8345C32.1177 13.8345 32.3198 13.874 32.4956 13.9531C32.6714 14.0234 32.8296 14.1113 32.9702 14.2168L38.7578 19.1343C39.1182 19.4331 39.2939 19.7979 39.2852 20.2285C39.2852 20.6504 39.1094 21.0107 38.7578 21.3096L32.9702 26.2271C32.8296 26.3501 32.6714 26.4468 32.4956 26.5171C32.3198 26.5874 32.1177 26.6226 31.8892 26.6226C31.4146 26.6226 31.041 26.4819 30.7686 26.2007C30.4961 25.9194 30.3599 25.5415 30.3599 25.0669V22.1929H20.459C19.1846 22.1929 18.1826 22.5269 17.4531 23.1948C16.7236 23.8628 16.3589 24.7812 16.3589 25.9502V26.873C16.3589 27.4531 16.1523 27.9541 15.7393 28.376C15.3262 28.7891 14.8296 28.9956 14.2495 28.9956ZM41.7505 26.7017C42.3306 26.7017 42.8271 26.9082 43.2402 27.3213C43.6621 27.7344 43.873 28.2354 43.873 28.8242V30.3535C43.873 31.8652 43.5303 33.166 42.8447 34.2559C42.1592 35.3457 41.1792 36.1851 39.9048 36.7739C38.6304 37.354 37.1055 37.644 35.3301 37.644H25.627V40.2676C25.627 40.751 25.4907 41.1333 25.2183 41.4146C24.9458 41.6958 24.5723 41.8364 24.0977 41.8364C23.8691 41.8364 23.6626 41.7969 23.478 41.7178C23.3022 41.6475 23.1484 41.5552 23.0166 41.4409L17.2158 36.5366C16.873 36.2466 16.6973 35.8862 16.6885 35.4556C16.6885 35.0249 16.8643 34.6558 17.2158 34.3481L23.0166 29.4307C23.1484 29.3164 23.3022 29.2241 23.478 29.1538C23.6626 29.0835 23.8691 29.0483 24.0977 29.0483C24.5723 29.0483 24.9458 29.189 25.2183 29.4702C25.4907 29.7427 25.627 30.125 25.627 30.6172V33.4912H35.5278C36.8022 33.4912 37.8042 33.1616 38.5337 32.5024C39.2632 31.8345 39.6279 30.916 39.6279 29.7471V28.8242C39.6279 28.2354 39.8301 27.7344 40.2344 27.3213C40.6475 26.9082 41.1528 26.7017 41.7505 26.7017Z",
		fill: "white"
	})
});
const ForwardRef$4 = forwardRef(SvgRepeat);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/PrebuiltLyricPlayer/repeat-active.svg
const SvgRepeatActive = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 56,
	height: 56,
	viewBox: "0 0 56 56",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M37.5805 0H18.4195C12.0146 0 9.69208 0.666878 7.35056 1.91914C5.00904 3.1714 3.1714 5.00904 1.91914 7.35056C0.666879 9.69208 0 12.0146 0 18.4195V37.5805C0 43.9854 0.666879 46.3079 1.91914 48.6494C3.1714 50.991 5.00904 52.8286 7.35056 54.0809C9.69208 55.3331 12.0146 56 18.4195 56H37.5805C43.9854 56 46.3079 55.3331 48.6495 54.0809C50.991 52.8286 52.8286 50.991 54.0809 48.6494C55.3331 46.3079 56 43.9854 56 37.5805V18.4195C56 12.0146 55.3331 9.69208 54.0809 7.35056C52.8286 5.00904 50.991 3.1714 48.6495 1.91914C46.3079 0.666878 43.9854 0 37.5805 0ZM12.7334 28.376C13.1465 28.7891 13.6519 28.9956 14.2495 28.9956C14.8296 28.9956 15.3262 28.7891 15.7393 28.376C16.1523 27.9541 16.3589 27.4531 16.3589 26.873V25.9502C16.3589 24.7812 16.7236 23.8628 17.4531 23.1948C18.1826 22.5269 19.1846 22.1929 20.459 22.1929H30.3599V25.0669C30.3599 25.5415 30.4961 25.9194 30.7686 26.2007C31.041 26.4819 31.4146 26.6226 31.8892 26.6226C32.1177 26.6226 32.3198 26.5874 32.4956 26.5171C32.6714 26.4468 32.8296 26.3501 32.9702 26.2271L38.7578 21.3096C39.1094 21.0107 39.2852 20.6504 39.2852 20.2285C39.2939 19.7979 39.1182 19.4331 38.7578 19.1343L32.9702 14.2168C32.8296 14.1113 32.6714 14.0234 32.4956 13.9531C32.3198 13.874 32.1177 13.8345 31.8892 13.8345C31.4146 13.8345 31.041 13.9751 30.7686 14.2563C30.4961 14.5288 30.3599 14.9111 30.3599 15.4033V18.0532H20.6436C18.877 18.0532 17.3564 18.3477 16.082 18.9365C14.8076 19.5166 13.8276 20.3516 13.1421 21.4414C12.4565 22.5312 12.1138 23.832 12.1138 25.3438V26.873C12.1138 27.4531 12.3203 27.9541 12.7334 28.376ZM43.2402 27.3213C42.8271 26.9082 42.3306 26.7017 41.7505 26.7017C41.1528 26.7017 40.6475 26.9082 40.2344 27.3213C39.8301 27.7344 39.6279 28.2354 39.6279 28.8242V29.7471C39.6279 30.916 39.2632 31.8345 38.5337 32.5024C37.8042 33.1616 36.8022 33.4912 35.5278 33.4912H25.627V30.6172C25.627 30.125 25.4907 29.7427 25.2183 29.4702C24.9458 29.189 24.5723 29.0483 24.0977 29.0483C23.8691 29.0483 23.6626 29.0835 23.478 29.1538C23.3022 29.2241 23.1484 29.3164 23.0166 29.4307L17.2158 34.3481C16.8643 34.6558 16.6885 35.0249 16.6885 35.4556C16.6973 35.8862 16.873 36.2466 17.2158 36.5366L23.0166 41.4409C23.1484 41.5552 23.3022 41.6475 23.478 41.7178C23.6626 41.7969 23.8691 41.8364 24.0977 41.8364C24.5723 41.8364 24.9458 41.6958 25.2183 41.4146C25.4907 41.1333 25.627 40.751 25.627 40.2676V37.644H35.3301C37.1055 37.644 38.6304 37.354 39.9048 36.7739C41.1792 36.1851 42.1592 35.3457 42.8447 34.2559C43.5303 33.166 43.873 31.8652 43.873 30.3535V28.8242C43.873 28.2354 43.6621 27.7344 43.2402 27.3213Z",
		fill: "white"
	})
});
const ForwardRef$3 = forwardRef(SvgRepeatActive);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/PrebuiltLyricPlayer/repeat-one-active.svg
const SvgRepeatOneActive = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 56,
	height: 56,
	viewBox: "0 0 56 56",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M37.5805 0H18.4195C12.0146 0 9.69208 0.666878 7.35056 1.91914C5.00904 3.1714 3.1714 5.00904 1.91914 7.35056C0.666879 9.69208 0 12.0146 0 18.4195V37.5805C0 43.9854 0.666879 46.3079 1.91914 48.6494C3.1714 50.991 5.00904 52.8286 7.35056 54.0809C9.69208 55.3331 12.0146 56 18.4195 56H37.5805C43.9854 56 46.3079 55.3331 48.6495 54.0809C50.991 52.8286 52.8286 50.991 54.0809 48.6494C55.3331 46.3079 56 43.9854 56 37.5805V18.4195C56 12.0146 55.3331 9.69208 54.0809 7.35056C52.8286 5.00904 50.991 3.1714 48.6495 1.91914C46.3079 0.666878 43.9854 0 37.5805 0ZM13.2212 28.4946C13.5552 28.8198 13.9858 28.9824 14.5132 28.9824C15.0405 28.9824 15.4668 28.8198 15.792 28.4946C16.1172 28.1606 16.2798 27.73 16.2798 27.2026V26.1743C16.2798 25.0142 16.6401 24.1001 17.3608 23.4321C18.0903 22.7554 19.0791 22.417 20.3271 22.417H26.5103V25.3701C26.5103 25.7744 26.6245 26.0952 26.853 26.3325C27.0903 26.561 27.4111 26.6753 27.8154 26.6753C28 26.6753 28.1714 26.6445 28.3296 26.583C28.4878 26.5215 28.6284 26.438 28.7515 26.3325L34.2622 21.6919C34.5698 21.437 34.7236 21.1294 34.7236 20.769C34.7236 20.3999 34.5698 20.0879 34.2622 19.833L28.7515 15.1924C28.6284 15.0869 28.4878 15.0034 28.3296 14.9419C28.1714 14.8804 28 14.8496 27.8154 14.8496C27.4111 14.8496 27.0903 14.9683 26.853 15.2056C26.6245 15.4341 26.5103 15.7549 26.5103 16.168V18.9629H20.5249C18.9165 18.9629 17.5322 19.2354 16.3721 19.7803C15.2119 20.3164 14.3154 21.0898 13.6826 22.1006C13.0498 23.1113 12.7334 24.3198 12.7334 25.7261V27.2026C12.7334 27.73 12.896 28.1606 13.2212 28.4946ZM42.7393 27.6509C42.4141 27.3257 41.9878 27.1631 41.4604 27.1631C40.9331 27.1631 40.5068 27.3257 40.1816 27.6509C39.8564 27.9761 39.6938 28.4067 39.6938 28.9429V29.9712C39.6938 31.1313 39.3291 32.0454 38.5996 32.7134C37.8789 33.3813 36.8945 33.7153 35.6465 33.7153H25.6138V30.7754C25.6138 30.3623 25.4995 30.0415 25.271 29.813C25.0425 29.5757 24.7261 29.457 24.3218 29.457C24.1284 29.457 23.9526 29.4878 23.7944 29.5493C23.6362 29.6108 23.4956 29.6943 23.3726 29.7998L17.8618 34.4404C17.563 34.7041 17.4136 35.0161 17.4136 35.3765C17.4136 35.7368 17.563 36.0444 17.8618 36.2993L23.3726 40.9399C23.4956 41.0454 23.6362 41.1289 23.7944 41.1904C23.9526 41.252 24.1284 41.2827 24.3218 41.2827C24.7261 41.2827 25.0425 41.1641 25.271 40.9268C25.4995 40.6982 25.6138 40.3818 25.6138 39.9775V37.1826H35.4487C37.0483 37.1826 38.4282 36.9146 39.5884 36.3784C40.7573 35.8335 41.6582 35.0557 42.291 34.0449C42.9238 33.0254 43.2402 31.8169 43.2402 30.4194V28.9429C43.2402 28.4067 43.0732 27.9761 42.7393 27.6509ZM40.2871 24.1968C40.6035 24.4868 41.021 24.6318 41.5396 24.6318C42.0669 24.6318 42.4844 24.4868 42.792 24.1968C43.1084 23.9067 43.2666 23.4629 43.2666 22.8652V16.603C43.2666 16.0142 43.0776 15.5396 42.6997 15.1792C42.3306 14.8188 41.856 14.6387 41.2759 14.6387C40.8188 14.6387 40.4189 14.709 40.0762 14.8496C39.7422 14.9902 39.3994 15.188 39.0479 15.4429L37.2812 16.7612C37.0176 16.9458 36.8374 17.1216 36.7407 17.2886C36.644 17.4556 36.5957 17.6533 36.5957 17.8818C36.5957 18.207 36.7012 18.4707 36.9121 18.6729C37.123 18.875 37.3911 18.9761 37.7163 18.9761C38.0151 18.9761 38.2832 18.8838 38.5205 18.6992L39.707 17.7632H39.8125V22.8652C39.8125 23.4629 39.9707 23.9067 40.2871 24.1968Z",
		fill: "white"
	})
});
const ForwardRef$2 = forwardRef(SvgRepeatOneActive);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/PrebuiltLyricPlayer/shuffle.svg
const SvgShuffle = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 56,
	height: 56,
	viewBox: "0 0 56 56",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		d: "M10.624 36.3125C10.624 35.75 10.8218 35.2754 11.2173 34.8887C11.6216 34.4932 12.1094 34.2954 12.6807 34.2954H15.4756C16.3896 34.2954 17.1455 34.1372 17.7432 33.8208C18.3496 33.5044 18.9341 32.9946 19.4966 32.2915L27.3936 22.3379C28.3955 21.0811 29.4282 20.2285 30.4917 19.7803C31.5552 19.332 32.79 19.1079 34.1963 19.1079H36.4243V16.1548C36.4243 15.6714 36.5605 15.2935 36.833 15.021C37.1055 14.7397 37.479 14.5991 37.9536 14.5991C38.1821 14.5991 38.3843 14.6343 38.5601 14.7046C38.7446 14.7749 38.9072 14.8672 39.0479 14.9814L44.8223 19.8857C45.1826 20.1846 45.3628 20.5493 45.3628 20.98C45.3628 21.4106 45.1826 21.7754 44.8223 22.0742L39.0479 26.9917C38.9072 27.106 38.7446 27.2026 38.5601 27.2817C38.3843 27.3521 38.1821 27.3872 37.9536 27.3872C37.479 27.3872 37.1055 27.2466 36.833 26.9653C36.5605 26.6841 36.4243 26.3018 36.4243 25.8184V23.1421H33.9194C33.3218 23.1421 32.8076 23.2036 32.377 23.3267C31.9551 23.4497 31.564 23.6562 31.2036 23.9463C30.8521 24.2275 30.4829 24.6143 30.0962 25.1064L21.606 35.7061C20.8853 36.6113 20.0986 37.2749 19.2461 37.6968C18.3936 38.1099 17.3389 38.3164 16.082 38.3164H12.6807C12.1094 38.3164 11.6216 38.123 11.2173 37.7363C10.8218 37.3496 10.624 36.875 10.624 36.3125ZM10.624 21.125C10.624 20.5625 10.8218 20.0879 11.2173 19.7012C11.6216 19.3057 12.1094 19.1079 12.6807 19.1079H15.7261C16.9829 19.1079 18.0947 19.3188 19.0615 19.7407C20.0371 20.1538 20.8853 20.8174 21.606 21.7314L30.0435 32.2783C30.5972 32.9727 31.1992 33.4824 31.8496 33.8076C32.5 34.1328 33.291 34.2954 34.2227 34.2954H36.4243V31.5664C36.4243 31.083 36.5605 30.7007 36.833 30.4194C37.1055 30.1382 37.479 29.9976 37.9536 29.9976C38.1821 29.9976 38.3843 30.0371 38.5601 30.1162C38.7446 30.1865 38.9072 30.2832 39.0479 30.4062L44.8223 35.2974C45.1826 35.5962 45.3628 35.9609 45.3628 36.3916C45.3628 36.8223 45.1826 37.187 44.8223 37.4858L39.0479 42.3901C38.9072 42.5132 38.7446 42.6099 38.5601 42.6802C38.3843 42.7593 38.1821 42.7988 37.9536 42.7988C37.479 42.7988 37.1055 42.6582 36.833 42.377C36.5605 42.0957 36.4243 41.7134 36.4243 41.23V38.3164H34.1699C32.9043 38.3164 31.7222 38.1011 30.6235 37.6704C29.5249 37.231 28.5625 36.4927 27.7363 35.4556L19.4966 25.146C18.9341 24.4429 18.2925 23.9331 17.5718 23.6167C16.8599 23.3003 16.0381 23.1421 15.1064 23.1421H12.6807C12.1094 23.1421 11.6216 22.9443 11.2173 22.5488C10.8218 22.1533 10.624 21.6787 10.624 21.125Z",
		fill: "white"
	})
});
const ForwardRef$1 = forwardRef(SvgShuffle);
//#endregion
//#region \0svgr:C:/GitHub/applemusic-like-lyrics/packages/react-full/src/components/PrebuiltLyricPlayer/shuffle-active.svg
const SvgShuffleActive = (props, ref) => /* @__PURE__ */ jsx("svg", {
	width: 56,
	height: 56,
	viewBox: "0 0 56 56",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	ref,
	...props,
	children: /* @__PURE__ */ jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M37.5805 0H18.4195C12.0146 0 9.69208 0.666878 7.35056 1.91914C5.00904 3.1714 3.1714 5.00904 1.91914 7.35056C0.666879 9.69208 0 12.0146 0 18.4195V37.5805C0 43.9854 0.666879 46.3079 1.91914 48.6494C3.1714 50.991 5.00904 52.8286 7.35056 54.0809C9.69208 55.3331 12.0146 56 18.4195 56H37.5805C43.9854 56 46.3079 55.3331 48.6495 54.0809C50.991 52.8286 52.8286 50.991 54.0809 48.6494C55.3331 46.3079 56 43.9854 56 37.5805V18.4195C56 12.0146 55.3331 9.69208 54.0809 7.35056C52.8286 5.00904 50.991 3.1714 48.6495 1.91914C46.3079 0.666878 43.9854 0 37.5805 0ZM11.2173 34.8887C10.8218 35.2754 10.624 35.75 10.624 36.3125C10.624 36.875 10.8218 37.3496 11.2173 37.7363C11.6216 38.123 12.1094 38.3164 12.6807 38.3164H16.082C17.3389 38.3164 18.3936 38.1099 19.2461 37.6968C20.0986 37.2749 20.8853 36.6113 21.606 35.7061L24.7747 31.75L27.7363 35.4556C28.5625 36.4927 29.5249 37.231 30.6235 37.6704C31.7222 38.1011 32.9043 38.3164 34.1699 38.3164H36.4243V41.23C36.4243 41.7134 36.5605 42.0957 36.833 42.377C37.1055 42.6582 37.479 42.7988 37.9536 42.7988C38.1821 42.7988 38.3843 42.7593 38.5601 42.6802C38.7446 42.6099 38.9072 42.5132 39.0479 42.3901L44.8223 37.4858C45.1826 37.187 45.3628 36.8223 45.3628 36.3916C45.3628 35.9609 45.1826 35.5962 44.8223 35.2974L39.0479 30.4062C38.9072 30.2832 38.7446 30.1865 38.5601 30.1162C38.3843 30.0371 38.1821 29.9976 37.9536 29.9976C37.479 29.9976 37.1055 30.1382 36.833 30.4194C36.5605 30.7007 36.4243 31.083 36.4243 31.5664V34.2954H34.2227C33.291 34.2954 32.5 34.1328 31.8496 33.8076C31.1992 33.4824 30.5972 32.9727 30.0435 32.2783L27.1993 28.7231L30.0962 25.1064C30.4829 24.6143 30.8521 24.2275 31.2036 23.9463C31.564 23.6562 31.9551 23.4497 32.377 23.3267C32.8076 23.2036 33.3218 23.1421 33.9194 23.1421H36.4243V25.8184C36.4243 26.3018 36.5605 26.6841 36.833 26.9653C37.1055 27.2466 37.479 27.3872 37.9536 27.3872C38.1821 27.3872 38.3843 27.3521 38.5601 27.2817C38.7446 27.2026 38.9072 27.106 39.0479 26.9917L44.8223 22.0742C45.1826 21.7754 45.3628 21.4106 45.3628 20.98C45.3628 20.5493 45.1826 20.1846 44.8223 19.8857L39.0479 14.9814C38.9072 14.8672 38.7446 14.7749 38.5601 14.7046C38.3843 14.6343 38.1821 14.5991 37.9536 14.5991C37.479 14.5991 37.1055 14.7397 36.833 15.021C36.5605 15.2935 36.4243 15.6714 36.4243 16.1548V19.1079H34.1963C32.79 19.1079 31.5552 19.332 30.4917 19.7803C29.4282 20.2285 28.3955 21.0811 27.3936 22.3379L24.7534 25.6657L21.606 21.7314C20.8853 20.8174 20.0371 20.1538 19.0615 19.7407C18.0947 19.3188 16.9829 19.1079 15.7261 19.1079H12.6807C12.1094 19.1079 11.6216 19.3057 11.2173 19.7012C10.8218 20.0879 10.624 20.5625 10.624 21.125C10.624 21.6787 10.8218 22.1533 11.2173 22.5488C11.6216 22.9443 12.1094 23.1421 12.6807 23.1421H15.1064C16.0381 23.1421 16.8599 23.3003 17.5718 23.6167C18.2925 23.9331 18.9341 24.4429 19.4966 25.146L22.3415 28.7056L19.4966 32.2915C18.9341 32.9946 18.3496 33.5044 17.7432 33.8208C17.1455 34.1372 16.3896 34.2954 15.4756 34.2954H12.6807C12.1094 34.2954 11.6216 34.4932 11.2173 34.8887Z",
		fill: "white"
	})
});
const ForwardRef = forwardRef(SvgShuffleActive);
//#endregion
//#region src/states/callbacks.ts
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const c$1 = (_onEmit) => ({});
/**
* 点击歌曲专辑图上方的控制横条时触发
*
* 通常用于关闭歌词页面
*/
const onClickControlThumbAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onClickControlThumbAtom", atom(c$1(() => {})));
/**
* 点击音质标签时触发
*
* 通常用于打开音质详情对话框
*/
onClickControlThumbAtom.debugLabel = "onClickControlThumbAtom";
const onClickAudioQualityTagAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onClickAudioQualityTagAtom", atom(c$1(() => {})));
/**
* 点击菜单按钮时触发
*/
onClickAudioQualityTagAtom.debugLabel = "onClickAudioQualityTagAtom";
const onRequestOpenMenuAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onRequestOpenMenuAtom", atom(c$1(() => {})));
/**
* 点击暂停或播放按钮时触发
*/
onRequestOpenMenuAtom.debugLabel = "onRequestOpenMenuAtom";
const onPlayOrResumeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onPlayOrResumeAtom", atom(c$1(() => {})));
/**
* 点击上一首按钮时触发
*/
onPlayOrResumeAtom.debugLabel = "onPlayOrResumeAtom";
const onRequestPrevSongAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onRequestPrevSongAtom", atom(c$1(() => {})));
/**
* 点击下一首按钮时触发
*/
onRequestPrevSongAtom.debugLabel = "onRequestPrevSongAtom";
const onRequestNextSongAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onRequestNextSongAtom", atom(c$1(() => {})));
/**
* 拖动进度条触发跳转时触发
* @param position - 目标播放位置，单位为毫秒
*/
onRequestNextSongAtom.debugLabel = "onRequestNextSongAtom";
const onSeekPositionAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onSeekPositionAtom", atom(c$1((_position) => {})));
/**
* 当某个歌词行被左键点击时触发
* @param _evt 歌词行的事件对象，可以访问到对应的歌词行信息和歌词行索引
* @param _playerRef 歌词播放组件的引用
*/
onSeekPositionAtom.debugLabel = "onSeekPositionAtom";
const onLyricLineClickAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onLyricLineClickAtom", atom(c$1((_evt, _playerRef) => {})));
/**
* 当某个歌词行被右键点击时触发
* @param _evt 歌词行的事件对象，可以访问到对应的歌词行信息和歌词行索引
* @param _playerRef 歌词播放组件的引用
*/
onLyricLineClickAtom.debugLabel = "onLyricLineClickAtom";
const onLyricLineContextMenuAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onLyricLineContextMenuAtom", atom(c$1((_evt, _playerRef) => {})));
/**
* 通过音量滑块改变音量时触发
* @param volume - 目标音量，取值范围为 [0-1]
*/
onLyricLineContextMenuAtom.debugLabel = "onLyricLineContextMenuAtom";
const onChangeVolumeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onChangeVolumeAtom", atom(c$1((_volume) => {})));
/**
* 点击随机按钮时触发
*/
onChangeVolumeAtom.debugLabel = "onChangeVolumeAtom";
const onToggleShuffleAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onToggleShuffleAtom", atom(c$1(() => {})));
/**
* 点击循环按钮时触发
*/
onToggleShuffleAtom.debugLabel = "onToggleShuffleAtom";
const onCycleRepeatModeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\callbacks.ts/onCycleRepeatModeAtom", atom(c$1(() => {})));
onCycleRepeatModeAtom.debugLabel = "onCycleRepeatModeAtom";
//#endregion
//#region src/states/configAtoms.ts
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
/**
* 播放器底部控制区域的控制组件类型
* - `Controls`: 播放控制按钮
* - `FFT`: 音频可视化内容
* - `None`: 不显示任何内容
*/
let PlayerControlsType = /* @__PURE__ */ function(PlayerControlsType) {
	PlayerControlsType["Controls"] = "controls";
	PlayerControlsType["FFT"] = "fft";
	PlayerControlsType["None"] = "none";
	return PlayerControlsType;
}({});
/**
* 在隐藏歌词的情况下专辑图的布局方式：
* - `Auto`: 根据专辑图是否为视频以使用沉浸布局
* - `ForceNormal`: 强制使用默认的专辑图布局
* - `ForceImmersive`: 强制使用沉浸式的专辑图布局
*/
let VerticalCoverLayout = /* @__PURE__ */ function(VerticalCoverLayout) {
	VerticalCoverLayout["Auto"] = "auto";
	VerticalCoverLayout["ForceNormal"] = "force-normal";
	VerticalCoverLayout["ForceImmersive"] = "force-immersive";
	return VerticalCoverLayout;
}({});
/**
* 可用的歌词渲染器实现
*/
let LyricPlayerImplementation = /* @__PURE__ */ function(LyricPlayerImplementation) {
	LyricPlayerImplementation["Dom"] = "dom";
	return LyricPlayerImplementation;
}({});
/**
* 可用的预设歌词字体大小
*/
let LyricSizePreset = /* @__PURE__ */ function(LyricSizePreset) {
	LyricSizePreset["Tiny"] = "tiny";
	LyricSizePreset["ExtraSmall"] = "extra-small";
	LyricSizePreset["Small"] = "small";
	LyricSizePreset["Medium"] = "medium";
	LyricSizePreset["Large"] = "large";
	LyricSizePreset["ExtraLarge"] = "extra-large";
	LyricSizePreset["Huge"] = "huge";
	return LyricSizePreset;
}({});
const getInitialPlayerImplementation = () => {
	switch (localStorage.getItem("amll-react-full.lyricPlayerImplementation")) {
		default: return { lyricPlayer: DomLyricPlayer };
	}
};
/**
* 歌词播放组件的实现类型
* @default DomLyricPlayer
*/
const lyricPlayerImplementationAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricPlayerImplementationAtom", atom(getInitialPlayerImplementation()));
/**
* 是否启用歌词行模糊效果
*
* 性能影响：较高
* @default true
*/
lyricPlayerImplementationAtom.debugLabel = "lyricPlayerImplementationAtom";
const enableLyricLineBlurEffectAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/enableLyricLineBlurEffectAtom", atomWithStorage("amll-react-full.enableLyricLineBlurEffect", true));
/**
* 是否启用歌词行缩放效果
*
* 性能影响：无
* @default true
*/
enableLyricLineBlurEffectAtom.debugLabel = "enableLyricLineBlurEffectAtom";
const enableLyricLineScaleEffectAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/enableLyricLineScaleEffectAtom", atomWithStorage("amll-react-full.enableLyricLineScaleEffect", true));
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
enableLyricLineScaleEffectAtom.debugLabel = "enableLyricLineScaleEffectAtom";
const enableLyricLineSpringAnimationAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/enableLyricLineSpringAnimationAtom", atomWithStorage("amll-react-full.enableLyricLineSpringAnimation", true));
/**
* 是否显示翻译歌词行
*
* 性能影响：无
* @default true
*/
enableLyricLineSpringAnimationAtom.debugLabel = "enableLyricLineSpringAnimationAtom";
const enableLyricTranslationLineAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/enableLyricTranslationLineAtom", atomWithStorage("amll-react-full.enableLyricTranslationLine", true));
/**
* 是否显示音译歌词行
*
* 性能影响：无
* @default true
*/
enableLyricTranslationLineAtom.debugLabel = "enableLyricTranslationLineAtom";
const enableLyricRomanLineAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/enableLyricRomanLineAtom", atomWithStorage("amll-react-full.enableLyricRomanLine", true));
/**
* 是否交换音译和翻译歌词行的显示位置
*
* 性能影响：无
* @default false
*/
enableLyricRomanLineAtom.debugLabel = "enableLyricRomanLineAtom";
const enableLyricSwapTransRomanLineAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/enableLyricSwapTransRomanLineAtom", atomWithStorage("amll-react-full.enableLyricSwapTransRomanLine", false));
/**
* 调节逐词歌词时单词的渐变过渡宽度，单位为一个全角字的宽度
* - 如果要模拟 Apple Music for Android 的效果，可以设置为 1
* - 如果要模拟 Apple Music for iPad 的效果，可以设置为 0.5
* - 如需关闭逐词歌词时单词的渐变过渡效果，可以设置为 0
* @default 0.5
*/
enableLyricSwapTransRomanLineAtom.debugLabel = "enableLyricSwapTransRomanLineAtom";
const lyricWordFadeWidthAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricWordFadeWidthAtom", atomWithStorage("amll-react-full.lyricWordFadeWidth", .5));
/**
* 设置歌词组件的字体家族
*
* 以逗号分隔的字体名称组合，等同于 CSS 的 font-family 属性
* @default ""
*/
lyricWordFadeWidthAtom.debugLabel = "lyricWordFadeWidthAtom";
const lyricFontFamilyAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricFontFamilyAtom", atomWithStorage("amll-react-full.lyricFontFamily", ""));
/**
* 设置歌词组件的字体字重
*
* 等同于 CSS 的 font-weight 属性
* @default 600
*/
lyricFontFamilyAtom.debugLabel = "lyricFontFamilyAtom";
const lyricFontWeightAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricFontWeightAtom", atomWithStorage("amll-react-full.lyricFontWeight", 600));
/**
* 设置歌词组件的字符间距
*
* 等同于 CSS 的 letter-spacing 属性
* @default "normal"
*/
lyricFontWeightAtom.debugLabel = "lyricFontWeightAtom";
const lyricLetterSpacingAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricLetterSpacingAtom", atomWithStorage("amll-react-full.lyricLetterSpacing", "normal"));
/**
* 设置歌词的字体大小
* @default LyricSizePreset.Medium
*/
lyricLetterSpacingAtom.debugLabel = "lyricLetterSpacingAtom";
const lyricSizePresetAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricSizePresetAtom", atomWithStorage("amll-react-full.lyricSizePreset", "medium"));
/**
* 播放控制组件的显示类型，即歌曲信息下方的组件
*/
lyricSizePresetAtom.debugLabel = "lyricSizePresetAtom";
const playerControlsTypeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/playerControlsTypeAtom", atomWithStorage("amll-react-full.playerControlsType", "controls"));
/**
* 是否显示歌曲名称
* @default true
*/
playerControlsTypeAtom.debugLabel = "playerControlsTypeAtom";
const showMusicNameAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/showMusicNameAtom", atomWithStorage("amll-react-full.showMusicName", true));
/**
* 在隐藏歌词的情况下专辑图的布局方式
* @default VerticalCoverLayout.Auto
*/
showMusicNameAtom.debugLabel = "showMusicNameAtom";
const verticalCoverLayoutAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/verticalCoverLayoutAtom", atomWithStorage("amll-react-full.verticalCoverLayout", "auto"));
/**
* 是否显示歌曲作者
* @default true
*/
verticalCoverLayoutAtom.debugLabel = "verticalCoverLayoutAtom";
const showMusicArtistsAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/showMusicArtistsAtom", atomWithStorage("amll-react-full.showMusicArtists", true));
/**
* 是否显示歌曲专辑名称
*
* 如果同时启用三个，布局上可能不太好看，请酌情调节
* @default false
*/
showMusicArtistsAtom.debugLabel = "showMusicArtistsAtom";
const showMusicAlbumAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/showMusicAlbumAtom", atomWithStorage("amll-react-full.showMusicAlbum", false));
/**
* 是否显示音量控制条
* @default true
*/
showMusicAlbumAtom.debugLabel = "showMusicAlbumAtom";
const showVolumeControlAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/showVolumeControlAtom", atomWithStorage("amll-react-full.showVolumeControl", true));
/**
* 是否显示底部控制按钮组
*
* 在横向布局里是右下角的几个按钮，在竖向布局里是播放按钮下方的几个按钮
* @default true
*/
showVolumeControlAtom.debugLabel = "showVolumeControlAtom";
const showBottomControlAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/showBottomControlAtom", atomWithStorage("amll-react-full.showBottomControl", true));
showBottomControlAtom.debugLabel = "showBottomControlAtom";
const getInitialBackgroundRenderer = () => {
	switch (localStorage.getItem("amll-react-full.lyricBackgroundRenderer")) {
		case "pixi": return { renderer: PixiRenderer$1 };
		case "css-bg": return { renderer: "css-bg" };
		default: return { renderer: MeshGradientRenderer$1 };
	}
};
/**
* 配置所使用的歌词背景渲染器
*/
const lyricBackgroundRendererAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricBackgroundRendererAtom", atom(getInitialBackgroundRenderer()));
/**
* 当背景渲染器设置为纯色或CSS背景时，使用此值
* @default "#111111"
*/
lyricBackgroundRendererAtom.debugLabel = "lyricBackgroundRendererAtom";
const cssBackgroundPropertyAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/cssBackgroundPropertyAtom", atomWithStorage("amll-player.cssBackgroundProperty", "#111111"));
/**
* 调节背景的最大渲染帧率，较低的值可以提升性能
*
* 性能影响：高
* @default 60
*/
cssBackgroundPropertyAtom.debugLabel = "cssBackgroundPropertyAtom";
const lyricBackgroundFPSAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricBackgroundFPSAtom", atomWithStorage("amll-react-full.lyricBackgroundFPS", 60));
/**
* 调节背景的渲染倍率，较低的值可以提升性能
*
* 性能影响：高
* @default 1
*/
lyricBackgroundFPSAtom.debugLabel = "lyricBackgroundFPSAtom";
const lyricBackgroundRenderScaleAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricBackgroundRenderScaleAtom", atomWithStorage("amll-react-full.lyricBackgroundRenderScale", 1));
/**
* 是否启用背景静态模式
*
* 让背景会在除了切换歌曲变换封面的情况下保持静止，如果遇到了性能问题，可以考虑开启此项
*
* 注意：启用此项会导致背景跳动效果失效
* @default false
*/
lyricBackgroundRenderScaleAtom.debugLabel = "lyricBackgroundRenderScaleAtom";
const lyricBackgroundStaticModeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/lyricBackgroundStaticModeAtom", atomWithStorage("amll-react-full.lyricBackgroundStaticMode", false));
/**
* 控制歌词播放页面是否可见
*/
lyricBackgroundStaticModeAtom.debugLabel = "lyricBackgroundStaticModeAtom";
const isLyricPageOpenedAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/isLyricPageOpenedAtom", atom(false));
/**
* 是否隐藏歌词视图（即使有歌词数据）
* @default false
*/
isLyricPageOpenedAtom.debugLabel = "isLyricPageOpenedAtom";
const hideLyricViewAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/hideLyricViewAtom", atomWithStorage("amll-react-full.hideLyricView", false));
/**
* 是否在进度条上显示剩余时间而非当前时间
* @default true
*/
hideLyricViewAtom.debugLabel = "hideLyricViewAtom";
const showRemainingTimeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/showRemainingTimeAtom", atomWithStorage("amll-react-full.showRemainingTime", true));
/**
* 音频可视化频域范围
*
* 单位为赫兹（hz），此项会影响音频可视化和背景跳动效果的展示效果
* @default [80, 2000]
*/
showRemainingTimeAtom.debugLabel = "showRemainingTimeAtom";
const fftDataRangeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\configAtoms.ts/fftDataRangeAtom", atomWithStorage("amll-react-full.fftDataRange", [80, 2e3]));
fftDataRangeAtom.debugLabel = "fftDataRangeAtom";
//#endregion
//#region src/states/controlsAtoms.ts
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
/**
* 重复播放的模式
*/
let RepeatMode = /* @__PURE__ */ function(RepeatMode) {
	RepeatMode["Off"] = "off";
	RepeatMode["One"] = "one";
	RepeatMode["All"] = "all";
	return RepeatMode;
}({});
/**
* 随机播放是否开启
*/
const isShuffleActiveAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\controlsAtoms.ts/isShuffleActiveAtom", atom(false));
/**
* 当前的重复播放模式
*/
isShuffleActiveAtom.debugLabel = "isShuffleActiveAtom";
const repeatModeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\controlsAtoms.ts/repeatModeAtom", atom("off"));
/**
* 随机按钮是否可用
*/
repeatModeAtom.debugLabel = "repeatModeAtom";
const isShuffleEnabledAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\controlsAtoms.ts/isShuffleEnabledAtom", atom(true));
/**
* 重复按钮是否可用
*/
isShuffleEnabledAtom.debugLabel = "isShuffleEnabledAtom";
const isRepeatEnabledAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\controlsAtoms.ts/isRepeatEnabledAtom", atom(true));
/**
* 切换随机播放模式的动作
*/
isRepeatEnabledAtom.debugLabel = "isRepeatEnabledAtom";
const toggleShuffleActionAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\controlsAtoms.ts/toggleShuffleActionAtom", atom(null, (get) => {
	get(onToggleShuffleAtom).onEmit?.();
}));
/**
* 切换循环播放模式的动作
*/
toggleShuffleActionAtom.debugLabel = "toggleShuffleActionAtom";
const cycleRepeatModeActionAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\controlsAtoms.ts/cycleRepeatModeActionAtom", atom(null, (get) => {
	get(onCycleRepeatModeAtom).onEmit?.();
}));
cycleRepeatModeActionAtom.debugLabel = "cycleRepeatModeActionAtom";
//#endregion
//#region src/states/dataAtoms.ts
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
/**
* 音频质量的类型枚举
*/
let AudioQualityType = /* @__PURE__ */ function(AudioQualityType) {
	AudioQualityType["None"] = "none";
	AudioQualityType["Standard"] = "standard";
	AudioQualityType["Lossless"] = "lossless";
	AudioQualityType["HiResLossless"] = "hi-res-lossless";
	AudioQualityType["DolbyAtmos"] = "dolby-atmos";
	return AudioQualityType;
}({});
/**
* 当前播放歌曲的 ID
*/
const musicIdAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicIdAtom", atom(""));
/**
* 当前播放的音乐名称
*/
musicIdAtom.debugLabel = "musicIdAtom";
const musicNameAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicNameAtom", atom("未知歌曲"));
/**
* 当前播放的音乐创作者列表
*/
musicNameAtom.debugLabel = "musicNameAtom";
const musicArtistsAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicArtistsAtom", atom([{
	name: "未知创作者",
	id: "unknown"
}]));
/**
* 当前播放的音乐所属专辑名称
*/
musicArtistsAtom.debugLabel = "musicArtistsAtom";
const musicAlbumNameAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicAlbumNameAtom", atom("未知专辑"));
/**
* 当前播放的音乐专辑封面 URL
*
* 除了图片也可以是视频资源
*/
musicAlbumNameAtom.debugLabel = "musicAlbumNameAtom";
const musicCoverAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicCoverAtom", atom(""));
/**
* 当前播放的音乐专辑封面资源是否为视频
*/
musicCoverAtom.debugLabel = "musicCoverAtom";
const musicCoverIsVideoAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicCoverIsVideoAtom", atom(false));
/**
* 当前音乐的总时长，单位为毫秒
*/
musicCoverIsVideoAtom.debugLabel = "musicCoverIsVideoAtom";
const musicDurationAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicDurationAtom", atom(0));
/**
* 当前音乐是否正在播放
*/
musicDurationAtom.debugLabel = "musicDurationAtom";
const musicPlayingAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicPlayingAtom", atom(false));
/**
* 当前音乐的播放进度，单位为毫秒
*/
musicPlayingAtom.debugLabel = "musicPlayingAtom";
const musicPlayingPositionAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicPlayingPositionAtom", atom(0));
/**
* 当前播放的音乐音量大小，范围在 [0.0-1.0] 之间
*/
musicPlayingPositionAtom.debugLabel = "musicPlayingPositionAtom";
const musicVolumeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicVolumeAtom", atomWithStorage("amll-react-full.musicVolumeAtom", .5, void 0, { getOnInit: true }));
/**
* 当前播放的音乐的歌词数据
*/
musicVolumeAtom.debugLabel = "musicVolumeAtom";
const musicLyricLinesAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicLyricLinesAtom", atom([]));
/**
* 当前音乐的音质信息
*/
musicLyricLinesAtom.debugLabel = "musicLyricLinesAtom";
const musicQualityAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicQualityAtom", atom({
	type: "none",
	codec: "unknown",
	channels: 2,
	sampleRate: 44100,
	sampleFormat: "s16"
}));
/**
* 根据音质信息生成的、用于UI展示的标签内容
*
* 如果为 null 则不显示标签
*/
musicQualityAtom.debugLabel = "musicQualityAtom";
const musicQualityTagAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/musicQualityTagAtom", atom(null));
/**
* 用于音频可视化频谱图的实时频域数据
*/
musicQualityTagAtom.debugLabel = "musicQualityTagAtom";
const fftDataAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/fftDataAtom", atom([]));
/**
* 设置低频的音量大小，范围在 80hz-120hz 之间为宜，取值范围在 0.0-1.0 之间。
*
* 部分渲染器会根据音量大小调整背景效果（例如根据鼓点跳动）。如果无法获取到类似的数据，请传入 1.0 作为默认值，或不做任何处理。
*/
fftDataAtom.debugLabel = "fftDataAtom";
const lowFreqVolumeAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\states\\dataAtoms.ts/lowFreqVolumeAtom", atom(1));
lowFreqVolumeAtom.debugLabel = "lowFreqVolumeAtom";
//#endregion
//#region src/components/PrebuiltLyricPlayer/index.module.css
var index_module_default = {
	"autoLyricLayout": "QqoC1a_autoLyricLayout",
	"bigControls": "QqoC1a_bigControls",
	"bigMusicInfo": "QqoC1a_bigMusicInfo",
	"bigVolumeControl": "QqoC1a_bigVolumeControl",
	"controls": "QqoC1a_controls",
	"hideLyric": "QqoC1a_hideLyric",
	"horizontalControls": "QqoC1a_horizontalControls",
	"progressBarLabels": "QqoC1a_progressBarLabels",
	"qualityTag": "QqoC1a_qualityTag",
	"smallMusicInfo": "QqoC1a_smallMusicInfo",
	"songMediaButton": "QqoC1a_songMediaButton",
	"songMediaPlayButton": "QqoC1a_songMediaPlayButton"
};
//#endregion
//#region src/components/PrebuiltLyricPlayer/index.tsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const PrebuiltMusicInfo = (t0) => {
	const $ = c(15);
	const { className, style } = t0;
	const musicName = useAtomValue(musicNameAtom);
	const musicArtists = useAtomValue(musicArtistsAtom);
	const musicAlbum = useAtomValue(musicAlbumNameAtom);
	const onMenuClicked = useAtomValue(onRequestOpenMenuAtom).onEmit;
	const showMusicName = useAtomValue(showMusicNameAtom);
	const showMusicArtists = useAtomValue(showMusicArtistsAtom);
	const showMusicAlbum = useAtomValue(showMusicAlbumAtom);
	const fontFamily = useAtomValue(lyricFontFamilyAtom);
	const fontWeight = useAtomValue(lyricFontWeightAtom);
	const letterSpacing = useAtomValue(lyricLetterSpacingAtom);
	const t1 = fontFamily || void 0;
	const t2 = fontWeight || void 0;
	const t3 = letterSpacing || void 0;
	let t4;
	if ($[0] !== style || $[1] !== t1 || $[2] !== t2 || $[3] !== t3) {
		t4 = {
			...style,
			fontFamily: t1,
			fontWeight: t2,
			letterSpacing: t3
		};
		$[0] = style;
		$[1] = t1;
		$[2] = t2;
		$[3] = t3;
		$[4] = t4;
	} else t4 = $[4];
	const combinedStyle = t4;
	const t5 = showMusicName ? musicName : void 0;
	let t6;
	if ($[5] !== musicArtists || $[6] !== showMusicArtists) {
		t6 = showMusicArtists ? musicArtists.map(_temp) : void 0;
		$[5] = musicArtists;
		$[6] = showMusicArtists;
		$[7] = t6;
	} else t6 = $[7];
	const t7 = showMusicAlbum ? musicAlbum : void 0;
	let t8;
	if ($[8] !== className || $[9] !== combinedStyle || $[10] !== onMenuClicked || $[11] !== t5 || $[12] !== t6 || $[13] !== t7) {
		t8 = /* @__PURE__ */ jsx(MusicInfo, {
			className,
			style: combinedStyle,
			name: t5,
			artists: t6,
			album: t7,
			onMenuButtonClicked: onMenuClicked
		});
		$[8] = className;
		$[9] = combinedStyle;
		$[10] = onMenuClicked;
		$[11] = t5;
		$[12] = t6;
		$[13] = t7;
		$[14] = t8;
	} else t8 = $[14];
	return t8;
};
const PrebuiltMediaButtons = (t0) => {
	const $ = c(28);
	const { showOtherButtons } = t0;
	const musicIsPlaying = useAtomValue(musicPlayingAtom);
	const onRequestPrevSong = useAtomValue(onRequestPrevSongAtom).onEmit;
	const onRequestNextSong = useAtomValue(onRequestNextSongAtom).onEmit;
	const onPlayOrResume = useAtomValue(onPlayOrResumeAtom).onEmit;
	const isShuffleOn = useAtomValue(isShuffleActiveAtom);
	const currentRepeatMode = useAtomValue(repeatModeAtom);
	const toggleShuffle = useSetAtom(toggleShuffleActionAtom);
	const cycleRepeat = useSetAtom(cycleRepeatModeActionAtom);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = {
			width: "1.3em",
			height: "1.3em"
		};
		$[0] = t1;
	} else t1 = $[0];
	const iconStyle = t1;
	let t2;
	if ($[1] !== currentRepeatMode) {
		t2 = () => {
			switch (currentRepeatMode) {
				case "one": return /* @__PURE__ */ jsx(ForwardRef$2, {
					color: "#ffffffff",
					style: iconStyle
				});
				case "all": return /* @__PURE__ */ jsx(ForwardRef$3, {
					color: "#ffffffff",
					style: iconStyle
				});
				default: return /* @__PURE__ */ jsx(ForwardRef$4, {
					color: "#ffffffff",
					style: iconStyle
				});
			}
		};
		$[1] = currentRepeatMode;
		$[2] = t2;
	} else t2 = $[2];
	const renderRepeatIcon = t2;
	let t3;
	if ($[3] !== isShuffleOn || $[4] !== showOtherButtons || $[5] !== toggleShuffle) {
		t3 = showOtherButtons && /* @__PURE__ */ jsx(MediaButton, {
			className: index_module_default.songMediaButton,
			onClick: toggleShuffle,
			children: isShuffleOn ? /* @__PURE__ */ jsx(ForwardRef, {
				color: "#ffffffff",
				style: iconStyle
			}) : /* @__PURE__ */ jsx(ForwardRef$1, {
				color: "#ffffffff",
				style: iconStyle
			})
		});
		$[3] = isShuffleOn;
		$[4] = showOtherButtons;
		$[5] = toggleShuffle;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ jsx(ForwardRef$5, { color: "#FFFFFF" });
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== onRequestPrevSong) {
		t5 = /* @__PURE__ */ jsx(MediaButton, {
			className: index_module_default.songMediaButton,
			onClick: onRequestPrevSong,
			children: t4
		});
		$[8] = onRequestPrevSong;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== musicIsPlaying) {
		t6 = musicIsPlaying ? /* @__PURE__ */ jsx(ForwardRef$7, { color: "#FFFFFF" }) : /* @__PURE__ */ jsx(ForwardRef$6, { color: "#FFFFFF" });
		$[10] = musicIsPlaying;
		$[11] = t6;
	} else t6 = $[11];
	let t7;
	if ($[12] !== onPlayOrResume || $[13] !== t6) {
		t7 = /* @__PURE__ */ jsx(MediaButton, {
			className: index_module_default.songMediaPlayButton,
			onClick: onPlayOrResume,
			children: t6
		});
		$[12] = onPlayOrResume;
		$[13] = t6;
		$[14] = t7;
	} else t7 = $[14];
	let t8;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ jsx(ForwardRef$8, { color: "#FFFFFF" });
		$[15] = t8;
	} else t8 = $[15];
	let t9;
	if ($[16] !== onRequestNextSong) {
		t9 = /* @__PURE__ */ jsx(MediaButton, {
			className: index_module_default.songMediaButton,
			onClick: onRequestNextSong,
			children: t8
		});
		$[16] = onRequestNextSong;
		$[17] = t9;
	} else t9 = $[17];
	let t10;
	if ($[18] !== cycleRepeat || $[19] !== renderRepeatIcon || $[20] !== showOtherButtons) {
		t10 = showOtherButtons && /* @__PURE__ */ jsx(MediaButton, {
			className: index_module_default.songMediaButton,
			onClick: cycleRepeat,
			children: renderRepeatIcon()
		});
		$[18] = cycleRepeat;
		$[19] = renderRepeatIcon;
		$[20] = showOtherButtons;
		$[21] = t10;
	} else t10 = $[21];
	let t11;
	if ($[22] !== t10 || $[23] !== t3 || $[24] !== t5 || $[25] !== t7 || $[26] !== t9) {
		t11 = /* @__PURE__ */ jsxs(Fragment, { children: [
			t3,
			t5,
			t7,
			t9,
			t10
		] });
		$[22] = t10;
		$[23] = t3;
		$[24] = t5;
		$[25] = t7;
		$[26] = t9;
		$[27] = t11;
	} else t11 = $[27];
	return t11;
};
const TimeLabel = (t0) => {
	const $ = c(4);
	const { isRemaining } = t0;
	const currentPosition = useAtomValue(musicPlayingPositionAtom);
	const duration = useAtomValue(musicDurationAtom);
	const t1 = isRemaining ? (currentPosition - duration) / 1e3 : currentPosition / 1e3;
	let t2;
	if ($[0] !== t1) {
		t2 = toDuration(t1);
		$[0] = t1;
		$[1] = t2;
	} else t2 = $[1];
	const time = t2;
	let t3;
	if ($[2] !== time) {
		t3 = /* @__PURE__ */ jsx(Fragment, { children: time });
		$[2] = time;
		$[3] = t3;
	} else t3 = $[3];
	return t3;
};
const TotalDurationLabel = () => {
	const $ = c(4);
	const t0 = useAtomValue(musicDurationAtom) / 1e3;
	let t1;
	if ($[0] !== t0) {
		t1 = toDuration(t0);
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const time = t1;
	let t2;
	if ($[2] !== time) {
		t2 = /* @__PURE__ */ jsx(Fragment, { children: time });
		$[2] = time;
		$[3] = t2;
	} else t2 = $[3];
	return t2;
};
const manualSeekTriggerAtom = globalThis.jotaiAtomCache.get("C:\\GitHub\\applemusic-like-lyrics\\packages\\react-full\\src\\components\\PrebuiltLyricPlayer\\index.tsx/manualSeekTriggerAtom", atom(null));
manualSeekTriggerAtom.debugLabel = "manualSeekTriggerAtom";
const PrebuiltProgressBar = React.memo(() => {
	const $ = c(38);
	const musicDuration = useAtomValue(musicDurationAtom);
	const musicPosition = useAtomValue(musicPlayingPositionAtom);
	const musicIsPlaying = useAtomValue(musicPlayingAtom);
	const musicQualityTag = useAtomValue(musicQualityTagAtom);
	const onClickAudioQualityTag = useAtomValue(onClickAudioQualityTagAtom).onEmit;
	const onSeekPosition = useAtomValue(onSeekPositionAtom).onEmit;
	const setManualSeekTrigger = useSetAtom(manualSeekTriggerAtom);
	const [showRemaining, setShowRemaining] = useAtom(showRemainingTimeAtom);
	const fontFamily = useAtomValue(lyricFontFamilyAtom);
	const fontWeight = useAtomValue(lyricFontWeightAtom);
	const letterSpacing = useAtomValue(lyricLetterSpacingAtom);
	const t0 = fontFamily || void 0;
	const t1 = fontWeight || void 0;
	const t2 = letterSpacing || void 0;
	let t3;
	if ($[0] !== t0 || $[1] !== t1 || $[2] !== t2) {
		t3 = {
			fontFamily: t0,
			fontWeight: t1,
			letterSpacing: t2
		};
		$[0] = t0;
		$[1] = t1;
		$[2] = t2;
		$[3] = t3;
	} else t3 = $[3];
	const fontStyle = t3;
	let t4;
	if ($[4] !== onSeekPosition || $[5] !== setManualSeekTrigger) {
		t4 = (position) => {
			onSeekPosition?.(position);
			setManualSeekTrigger({
				time: position,
				timestamp: Date.now()
			});
		};
		$[4] = onSeekPosition;
		$[5] = setManualSeekTrigger;
		$[6] = t4;
	} else t4 = $[6];
	const handleSeek = t4;
	let t5;
	if ($[7] !== handleSeek || $[8] !== musicDuration || $[9] !== musicIsPlaying || $[10] !== musicPosition) {
		t5 = /* @__PURE__ */ jsx(BouncingSlider, {
			isPlaying: musicIsPlaying,
			min: 0,
			max: musicDuration,
			value: musicPosition,
			onChange: handleSeek
		});
		$[7] = handleSeek;
		$[8] = musicDuration;
		$[9] = musicIsPlaying;
		$[10] = musicPosition;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ jsx(TimeLabel, {});
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== fontStyle) {
		t7 = /* @__PURE__ */ jsx("div", {
			style: fontStyle,
			children: t6
		});
		$[13] = fontStyle;
		$[14] = t7;
	} else t7 = $[14];
	let t8;
	if ($[15] !== musicQualityTag || $[16] !== onClickAudioQualityTag) {
		t8 = musicQualityTag && /* @__PURE__ */ jsx(AudioQualityTag, {
			className: index_module_default.qualityTag,
			isDolbyAtmos: musicQualityTag.isDolbyAtmos,
			tagText: musicQualityTag.tagText,
			tagIcon: musicQualityTag.tagIcon,
			onClick: onClickAudioQualityTag
		});
		$[15] = musicQualityTag;
		$[16] = onClickAudioQualityTag;
		$[17] = t8;
	} else t8 = $[17];
	let t9;
	if ($[18] !== t8) {
		t9 = /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(AnimatePresence, {
			mode: "popLayout",
			children: t8
		}) });
		$[18] = t8;
		$[19] = t9;
	} else t9 = $[19];
	let t10;
	if ($[20] !== fontStyle) {
		t10 = {
			...fontStyle,
			cursor: "pointer",
			userSelect: "none"
		};
		$[20] = fontStyle;
		$[21] = t10;
	} else t10 = $[21];
	let t11;
	if ($[22] !== setShowRemaining || $[23] !== showRemaining) {
		t11 = () => setShowRemaining(!showRemaining);
		$[22] = setShowRemaining;
		$[23] = showRemaining;
		$[24] = t11;
	} else t11 = $[24];
	let t12;
	if ($[25] !== showRemaining) {
		t12 = showRemaining ? /* @__PURE__ */ jsx(TimeLabel, { isRemaining: true }) : /* @__PURE__ */ jsx(TotalDurationLabel, {});
		$[25] = showRemaining;
		$[26] = t12;
	} else t12 = $[26];
	let t13;
	if ($[27] !== t10 || $[28] !== t11 || $[29] !== t12) {
		t13 = /* @__PURE__ */ jsx("div", {
			style: t10,
			onClick: t11,
			children: t12
		});
		$[27] = t10;
		$[28] = t11;
		$[29] = t12;
		$[30] = t13;
	} else t13 = $[30];
	let t14;
	if ($[31] !== t13 || $[32] !== t7 || $[33] !== t9) {
		t14 = /* @__PURE__ */ jsxs("div", {
			className: index_module_default.progressBarLabels,
			children: [
				t7,
				t9,
				t13
			]
		});
		$[31] = t13;
		$[32] = t7;
		$[33] = t9;
		$[34] = t14;
	} else t14 = $[34];
	let t15;
	if ($[35] !== t14 || $[36] !== t5) {
		t15 = /* @__PURE__ */ jsxs("div", { children: [t5, t14] });
		$[35] = t14;
		$[36] = t5;
		$[37] = t15;
	} else t15 = $[37];
	return t15;
});
function getLyricFontSizeFromPreset(preset) {
	switch (preset) {
		case "tiny": return "max(max(2.5vh, 1.25vw), 10px)";
		case "extra-small": return "max(max(3vh, 1.5vw), 10px)";
		case "small": return "max(max(4vh, 2vw), 12px)";
		case "large": return "max(max(6vh, 3vw), 16px)";
		case "extra-large": return "max(max(7vh, 3.5vw), 18px)";
		case "huge": return "max(max(8vh, 4vw), 20px)";
		default: return "max(max(5vh, 2.5vw), 14px)";
	}
}
const PrebuiltCoreLyricPlayer = (t0) => {
	const $ = c(36);
	const { alignPosition, alignAnchor, bottomLine, optimizeOptions } = t0;
	const amllPlayerRef = useRef(null);
	const musicIsPlaying = useAtomValue(musicPlayingAtom);
	const lyricLines = useAtomValue(musicLyricLinesAtom);
	const isLyricPageOpened = useAtomValue(isLyricPageOpenedAtom);
	const musicPlayingPosition = useAtomValue(musicPlayingPositionAtom);
	const lyricFontFamily = useAtomValue(lyricFontFamilyAtom);
	const lyricFontWeight = useAtomValue(lyricFontWeightAtom);
	const lyricLetterSpacing = useAtomValue(lyricLetterSpacingAtom);
	const lyricSizePreset = useAtomValue(lyricSizePresetAtom);
	const lyricPlayerImplementation = useAtomValue(lyricPlayerImplementationAtom).lyricPlayer;
	const enableLyricLineBlurEffect = useAtomValue(enableLyricLineBlurEffectAtom);
	const enableLyricLineScaleEffect = useAtomValue(enableLyricLineScaleEffectAtom);
	const enableLyricLineSpringAnimation = useAtomValue(enableLyricLineSpringAnimationAtom);
	const lyricWordFadeWidth = useAtomValue(lyricWordFadeWidthAtom);
	const enableLyricTranslationLine = useAtomValue(enableLyricTranslationLineAtom);
	const enableLyricRomanLine = useAtomValue(enableLyricRomanLineAtom);
	const enableLyricSwapTransRomanLine = useAtomValue(enableLyricSwapTransRomanLineAtom);
	const onLyricLineClick = useAtomValue(onLyricLineClickAtom).onEmit;
	const onLyricLineContextMenu = useAtomValue(onLyricLineContextMenuAtom).onEmit;
	const manualSeekTrigger = useAtomValue(manualSeekTriggerAtom);
	let processed;
	if ($[0] !== enableLyricRomanLine || $[1] !== enableLyricSwapTransRomanLine || $[2] !== enableLyricTranslationLine || $[3] !== lyricLines) {
		processed = structuredClone(lyricLines);
		if (!enableLyricTranslationLine) for (const line of processed) line.translatedLyric = "";
		if (!enableLyricRomanLine) for (const line_0 of processed) line_0.romanLyric = "";
		if (enableLyricSwapTransRomanLine) for (const line_1 of processed) {
			const [t1, t2] = [line_1.romanLyric, line_1.translatedLyric];
			line_1.translatedLyric = t1;
			line_1.romanLyric = t2;
		}
		$[0] = enableLyricRomanLine;
		$[1] = enableLyricSwapTransRomanLine;
		$[2] = enableLyricTranslationLine;
		$[3] = lyricLines;
		$[4] = processed;
	} else processed = $[4];
	const processedLyricLines = processed;
	let t1;
	let t2;
	if ($[5] !== manualSeekTrigger) {
		t1 = () => {
			if (manualSeekTrigger) amllPlayerRef.current?.lyricPlayer?.setCurrentTime(manualSeekTrigger.time, true);
		};
		t2 = [manualSeekTrigger];
		$[5] = manualSeekTrigger;
		$[6] = t1;
		$[7] = t2;
	} else {
		t1 = $[6];
		t2 = $[7];
	}
	useEffect(t1, t2);
	const t3 = lyricFontFamily || void 0;
	const t4 = lyricFontWeight || void 0;
	const t5 = lyricLetterSpacing || void 0;
	let t6;
	if ($[8] !== lyricSizePreset) {
		t6 = getLyricFontSizeFromPreset(lyricSizePreset);
		$[8] = lyricSizePreset;
		$[9] = t6;
	} else t6 = $[9];
	let t7;
	if ($[10] !== t3 || $[11] !== t4 || $[12] !== t5 || $[13] !== t6) {
		t7 = {
			width: "100%",
			height: "100%",
			fontFamily: t3,
			fontWeight: t4,
			letterSpacing: t5,
			"--amll-lp-font-size": t6
		};
		$[10] = t3;
		$[11] = t4;
		$[12] = t5;
		$[13] = t6;
		$[14] = t7;
	} else t7 = $[14];
	const t8 = t7;
	const t9 = !isLyricPageOpened;
	let t10;
	if ($[15] !== onLyricLineClick) {
		t10 = (evt) => {
			const targetTime = evt.line.getLine().startTime;
			amllPlayerRef.current?.lyricPlayer?.setCurrentTime(targetTime, true);
			onLyricLineClick?.(evt, amllPlayerRef.current);
		};
		$[15] = onLyricLineClick;
		$[16] = t10;
	} else t10 = $[16];
	let t11;
	if ($[17] !== onLyricLineContextMenu) {
		t11 = (evt_0) => onLyricLineContextMenu?.(evt_0, amllPlayerRef.current);
		$[17] = onLyricLineContextMenu;
		$[18] = t11;
	} else t11 = $[18];
	let t12;
	if ($[19] !== alignAnchor || $[20] !== alignPosition || $[21] !== bottomLine || $[22] !== enableLyricLineBlurEffect || $[23] !== enableLyricLineScaleEffect || $[24] !== enableLyricLineSpringAnimation || $[25] !== lyricPlayerImplementation || $[26] !== lyricWordFadeWidth || $[27] !== musicIsPlaying || $[28] !== musicPlayingPosition || $[29] !== optimizeOptions || $[30] !== processedLyricLines || $[31] !== t10 || $[32] !== t11 || $[33] !== t8 || $[34] !== t9) {
		t12 = /* @__PURE__ */ jsx(LyricPlayer, {
			style: t8,
			ref: amllPlayerRef,
			playing: musicIsPlaying,
			disabled: t9,
			alignPosition,
			alignAnchor,
			currentTime: musicPlayingPosition,
			lyricLines: processedLyricLines,
			optimizeOptions,
			enableBlur: enableLyricLineBlurEffect,
			enableScale: enableLyricLineScaleEffect,
			enableSpring: enableLyricLineSpringAnimation,
			wordFadeWidth: lyricWordFadeWidth,
			lyricPlayer: lyricPlayerImplementation,
			onLyricLineClick: t10,
			onLyricLineContextMenu: t11,
			bottomLine
		});
		$[19] = alignAnchor;
		$[20] = alignPosition;
		$[21] = bottomLine;
		$[22] = enableLyricLineBlurEffect;
		$[23] = enableLyricLineScaleEffect;
		$[24] = enableLyricLineSpringAnimation;
		$[25] = lyricPlayerImplementation;
		$[26] = lyricWordFadeWidth;
		$[27] = musicIsPlaying;
		$[28] = musicPlayingPosition;
		$[29] = optimizeOptions;
		$[30] = processedLyricLines;
		$[31] = t10;
		$[32] = t11;
		$[33] = t8;
		$[34] = t9;
		$[35] = t12;
	} else t12 = $[35];
	return t12;
};
const PrebuiltVolumeControl = (t0) => {
	const $ = c(5);
	const { style, className } = t0;
	const musicVolume = useAtomValue(musicVolumeAtom);
	const onChangeVolume = useAtomValue(onChangeVolumeAtom).onEmit;
	if (useAtomValue(showVolumeControlAtom)) {
		let t1;
		if ($[0] !== className || $[1] !== musicVolume || $[2] !== onChangeVolume || $[3] !== style) {
			t1 = /* @__PURE__ */ jsx(VolumeControl, {
				value: musicVolume,
				min: 0,
				max: 1,
				style,
				className,
				onChange: onChangeVolume
			});
			$[0] = className;
			$[1] = musicVolume;
			$[2] = onChangeVolume;
			$[3] = style;
			$[4] = t1;
		} else t1 = $[4];
		return t1;
	}
	return null;
};
const PrebuiltMusicControls = (t0) => {
	const $ = c(17);
	let className;
	let props;
	let showOtherButtons;
	if ($[0] !== t0) {
		({className, showOtherButtons, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
		$[3] = showOtherButtons;
	} else {
		className = $[1];
		props = $[2];
		showOtherButtons = $[3];
	}
	const playerControlsType = useAtomValue(playerControlsTypeAtom);
	const fftData = useAtomValue(fftDataAtom);
	let t1;
	if ($[4] !== className) {
		t1 = classnames(index_module_default.controls, className);
		$[4] = className;
		$[5] = t1;
	} else t1 = $[5];
	let t2;
	if ($[6] !== playerControlsType || $[7] !== showOtherButtons) {
		t2 = playerControlsType === "controls" && /* @__PURE__ */ jsx(PrebuiltMediaButtons, { showOtherButtons });
		$[6] = playerControlsType;
		$[7] = showOtherButtons;
		$[8] = t2;
	} else t2 = $[8];
	let t3;
	if ($[9] !== fftData || $[10] !== playerControlsType) {
		t3 = playerControlsType === "fft" && /* @__PURE__ */ jsx(AudioFFTVisualizer, {
			style: {
				width: "100%",
				height: "8vh"
			},
			fftData
		});
		$[9] = fftData;
		$[10] = playerControlsType;
		$[11] = t3;
	} else t3 = $[11];
	let t4;
	if ($[12] !== props || $[13] !== t1 || $[14] !== t2 || $[15] !== t3) {
		t4 = /* @__PURE__ */ jsxs("div", {
			className: t1,
			...props,
			children: [t2, t3]
		});
		$[12] = props;
		$[13] = t1;
		$[14] = t2;
		$[15] = t3;
		$[16] = t4;
	} else t4 = $[16];
	return t4;
};
/**
* 已经部署好所有组件的歌词播放器组件，在正确设置所有的 Jotai 状态后可以开箱即用
*/
const PrebuiltLyricPlayer = (t0) => {
	const $ = c(67);
	let bottomLineSlot;
	let className;
	let optimizeOptions;
	let rest;
	if ($[0] !== t0) {
		({className, bottomLineSlot, optimizeOptions, ...rest} = t0);
		$[0] = t0;
		$[1] = bottomLineSlot;
		$[2] = className;
		$[3] = optimizeOptions;
		$[4] = rest;
	} else {
		bottomLineSlot = $[1];
		className = $[2];
		optimizeOptions = $[3];
		rest = $[4];
	}
	const [hideLyricView, setHideLyricView] = useAtom(hideLyricViewAtom);
	const musicCover = useAtomValue(musicCoverAtom);
	const musicCoverIsVideo = useAtomValue(musicCoverIsVideoAtom);
	const musicIsPlaying = useAtomValue(musicPlayingAtom);
	const lowFreqVolume = useAtomValue(lowFreqVolumeAtom);
	const isLyricPageOpened = useAtomValue(isLyricPageOpenedAtom);
	const lyricBackgroundFPS = useAtomValue(lyricBackgroundFPSAtom);
	const verticalCoverLayout = useAtomValue(verticalCoverLayoutAtom);
	const lyricBackgroundStaticMode = useAtomValue(lyricBackgroundStaticModeAtom);
	const lyricBackgroundRenderScale = useAtomValue(lyricBackgroundRenderScaleAtom);
	const onClickControlThumb = useAtomValue(onClickControlThumbAtom).onEmit;
	const [isVertical, setIsVertical] = useState(false);
	const [alignPosition, setAlignPosition] = useState(.25);
	const [alignAnchor, setAlignAnchor] = useState("top");
	const coverElRef = useRef(null);
	const [layoutEl, setLayoutEl] = useState(null);
	const backgroundRenderer = useAtomValue(lyricBackgroundRendererAtom);
	const showBottomControl = useAtomValue(showBottomControlAtom);
	const cssBackgroundProperty = useAtomValue(cssBackgroundPropertyAtom);
	let t1;
	let t2;
	if ($[5] !== isVertical || $[6] !== layoutEl) {
		t1 = () => {
			if (!isVertical && coverElRef.current && layoutEl) {
				const obz = new ResizeObserver(() => {
					if (!(coverElRef.current && layoutEl)) return;
					const coverB = coverElRef.current.getBoundingClientRect();
					const layoutB = layoutEl.getBoundingClientRect();
					setAlignPosition((coverB.top + coverB.height / 2 - layoutB.top) / layoutB.height);
				});
				obz.observe(coverElRef.current);
				obz.observe(layoutEl);
				setAlignAnchor("center");
				return () => obz.disconnect();
			}
			if (isVertical) {
				setAlignPosition(.1);
				setAlignAnchor("top");
			}
		};
		t2 = [isVertical, layoutEl];
		$[5] = isVertical;
		$[6] = layoutEl;
		$[7] = t1;
		$[8] = t2;
	} else {
		t1 = $[7];
		t2 = $[8];
	}
	useLayoutEffect(t1, t2);
	const verticalImmerseCover = hideLyricView && (verticalCoverLayout === "auto" ? musicCoverIsVideo && isVertical : verticalCoverLayout === "force-immersive");
	let t3;
	if ($[9] !== className) {
		t3 = classnames(index_module_default.autoLyricLayout, className);
		$[9] = className;
		$[10] = t3;
	} else t3 = $[10];
	const t4 = !musicIsPlaying && !musicCoverIsVideo && verticalImmerseCover;
	let t5;
	if ($[11] !== musicCover || $[12] !== musicCoverIsVideo || $[13] !== t4) {
		t5 = /* @__PURE__ */ jsx(Cover, {
			coverUrl: musicCover,
			coverIsVideo: musicCoverIsVideo,
			ref: coverElRef,
			musicPaused: t4
		});
		$[11] = musicCover;
		$[12] = musicCoverIsVideo;
		$[13] = t4;
		$[14] = t5;
	} else t5 = $[14];
	let t6;
	if ($[15] !== onClickControlThumb) {
		t6 = /* @__PURE__ */ jsx(ControlThumb, { onClick: onClickControlThumb });
		$[15] = onClickControlThumb;
		$[16] = t6;
	} else t6 = $[16];
	const t7 = hideLyricView && index_module_default.hideLyric;
	let t8;
	if ($[17] !== t7) {
		t8 = classnames(index_module_default.smallMusicInfo, t7);
		$[17] = t7;
		$[18] = t8;
	} else t8 = $[18];
	let t9;
	if ($[19] !== t8) {
		t9 = /* @__PURE__ */ jsx(PrebuiltMusicInfo, { className: t8 });
		$[19] = t8;
		$[20] = t9;
	} else t9 = $[20];
	let t10;
	if ($[21] !== backgroundRenderer.renderer || $[22] !== cssBackgroundProperty || $[23] !== isLyricPageOpened || $[24] !== lowFreqVolume || $[25] !== lyricBackgroundFPS || $[26] !== lyricBackgroundRenderScale || $[27] !== lyricBackgroundStaticMode || $[28] !== musicCover || $[29] !== musicCoverIsVideo) {
		t10 = typeof backgroundRenderer.renderer === "string" && backgroundRenderer.renderer === "css-bg" ? /* @__PURE__ */ jsx("div", { style: {
			zIndex: -1,
			width: "100%",
			height: "100%",
			minWidth: "0",
			minHeight: "0",
			overflow: "hidden",
			background: cssBackgroundProperty
		} }) : /* @__PURE__ */ jsx(BackgroundRender, {
			album: musicCover,
			albumIsVideo: musicCoverIsVideo,
			lowFreqVolume,
			renderScale: lyricBackgroundRenderScale,
			fps: lyricBackgroundFPS,
			renderer: typeof backgroundRenderer.renderer === "string" ? backgroundRenderer.renderer === "pixi" ? PixiRenderer : MeshGradientRenderer : backgroundRenderer.renderer,
			staticMode: lyricBackgroundStaticMode || !isLyricPageOpened,
			style: { zIndex: -1 }
		});
		$[21] = backgroundRenderer.renderer;
		$[22] = cssBackgroundProperty;
		$[23] = isLyricPageOpened;
		$[24] = lowFreqVolume;
		$[25] = lyricBackgroundFPS;
		$[26] = lyricBackgroundRenderScale;
		$[27] = lyricBackgroundStaticMode;
		$[28] = musicCover;
		$[29] = musicCoverIsVideo;
		$[30] = t10;
	} else t10 = $[30];
	const t11 = hideLyricView && index_module_default.hideLyric;
	let t12;
	if ($[31] !== t11) {
		t12 = classnames(index_module_default.bigMusicInfo, t11);
		$[31] = t11;
		$[32] = t12;
	} else t12 = $[32];
	let t13;
	if ($[33] !== t12) {
		t13 = /* @__PURE__ */ jsx(PrebuiltMusicInfo, { className: t12 });
		$[33] = t12;
		$[34] = t13;
	} else t13 = $[34];
	let t14;
	let t15;
	if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ jsx(PrebuiltProgressBar, {});
		t15 = /* @__PURE__ */ jsx(PrebuiltMusicControls, { className: index_module_default.bigControls });
		$[35] = t14;
		$[36] = t15;
	} else {
		t14 = $[35];
		t15 = $[36];
	}
	let t16;
	if ($[37] !== hideLyricView || $[38] !== setHideLyricView || $[39] !== showBottomControl) {
		t16 = showBottomControl && /* @__PURE__ */ jsxs("div", {
			style: {
				display: "flex",
				justifyContent: "space-evenly"
			},
			children: [
				/* @__PURE__ */ jsx(PrebuiltToggleIconButton, {
					type: "lyrics",
					checked: !hideLyricView,
					onClick: () => setHideLyricView(!hideLyricView)
				}),
				/* @__PURE__ */ jsx(PrebuiltToggleIconButton, { type: "airplay" }),
				/* @__PURE__ */ jsx(PrebuiltToggleIconButton, { type: "playlist" })
			]
		});
		$[37] = hideLyricView;
		$[38] = setHideLyricView;
		$[39] = showBottomControl;
		$[40] = t16;
	} else t16 = $[40];
	let t17;
	if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = /* @__PURE__ */ jsx(PrebuiltVolumeControl, { className: index_module_default.bigVolumeControl });
		$[41] = t17;
	} else t17 = $[41];
	let t18;
	if ($[42] !== t13 || $[43] !== t16) {
		t18 = /* @__PURE__ */ jsxs(Fragment, { children: [
			t13,
			t14,
			t15,
			t16,
			t17
		] });
		$[42] = t13;
		$[43] = t16;
		$[44] = t18;
	} else t18 = $[44];
	let t19;
	if ($[45] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx(PrebuiltMusicInfo, { className: index_module_default.horizontalControls }),
			/* @__PURE__ */ jsx(PrebuiltProgressBar, {}),
			/* @__PURE__ */ jsx(PrebuiltMusicControls, {
				className: index_module_default.controls,
				showOtherButtons: true
			}),
			/* @__PURE__ */ jsx(PrebuiltVolumeControl, {})
		] });
		$[45] = t19;
	} else t19 = $[45];
	let t20;
	if ($[46] !== hideLyricView || $[47] !== setHideLyricView || $[48] !== showBottomControl) {
		t20 = showBottomControl && /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx(PrebuiltToggleIconButton, { type: "playlist" }),
			/* @__PURE__ */ jsx(PrebuiltToggleIconButton, {
				type: "lyrics",
				checked: !hideLyricView,
				onClick: () => setHideLyricView(!hideLyricView)
			}),
			/* @__PURE__ */ jsx("div", { style: { flex: "1" } }),
			/* @__PURE__ */ jsx(PrebuiltToggleIconButton, { type: "airplay" })
		] });
		$[46] = hideLyricView;
		$[47] = setHideLyricView;
		$[48] = showBottomControl;
		$[49] = t20;
	} else t20 = $[49];
	let t21;
	if ($[50] !== alignAnchor || $[51] !== alignPosition || $[52] !== bottomLineSlot || $[53] !== optimizeOptions) {
		t21 = /* @__PURE__ */ jsx(PrebuiltCoreLyricPlayer, {
			alignPosition,
			alignAnchor,
			bottomLine: bottomLineSlot,
			optimizeOptions
		});
		$[50] = alignAnchor;
		$[51] = alignPosition;
		$[52] = bottomLineSlot;
		$[53] = optimizeOptions;
		$[54] = t21;
	} else t21 = $[54];
	let t22;
	if ($[55] !== hideLyricView || $[56] !== rest || $[57] !== t10 || $[58] !== t18 || $[59] !== t20 || $[60] !== t21 || $[61] !== t3 || $[62] !== t5 || $[63] !== t6 || $[64] !== t9 || $[65] !== verticalImmerseCover) {
		t22 = /* @__PURE__ */ jsx(LayoutGroup, { children: /* @__PURE__ */ jsx(AutoLyricLayout, {
			onElementMounted: setLayoutEl,
			className: t3,
			onLayoutChange: setIsVertical,
			verticalImmerseCover,
			coverSlot: t5,
			thumbSlot: t6,
			smallControlsSlot: t9,
			backgroundSlot: t10,
			bigControlsSlot: t18,
			controlsSlot: t19,
			horizontalBottomControls: t20,
			lyricSlot: t21,
			hideLyric: hideLyricView,
			...rest
		}) });
		$[55] = hideLyricView;
		$[56] = rest;
		$[57] = t10;
		$[58] = t18;
		$[59] = t20;
		$[60] = t21;
		$[61] = t3;
		$[62] = t5;
		$[63] = t6;
		$[64] = t9;
		$[65] = verticalImmerseCover;
		$[66] = t22;
	} else t22 = $[66];
	return t22;
};
function _temp(v) {
	return v.name;
}
//#endregion
//#region src/index.ts
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
//#endregion
export { AudioFFTVisualizer, AudioQualityTag, AudioQualityType, AutoLyricLayout, BouncingSlider, ControlThumb, Cover, HorizontalLayout, LyricPlayerImplementation, LyricSizePreset, MediaButton, MenuButton, MusicInfo, PlayerControlsType, PrebuiltLyricPlayer, PrebuiltToggleIconButton, PrebuiltToggleIconButtonType, RepeatMode, TextMarquee, ToggleIconButton, VerticalCoverLayout, VerticalLayout, VolumeControl, cssBackgroundPropertyAtom, cycleRepeatModeActionAtom, enableLyricLineBlurEffectAtom, enableLyricLineScaleEffectAtom, enableLyricLineSpringAnimationAtom, enableLyricRomanLineAtom, enableLyricSwapTransRomanLineAtom, enableLyricTranslationLineAtom, fftDataAtom, fftDataRangeAtom, hideLyricViewAtom, isLyricPageOpenedAtom, isRepeatEnabledAtom, isShuffleActiveAtom, isShuffleEnabledAtom, lowFreqVolumeAtom, lyricBackgroundFPSAtom, lyricBackgroundRenderScaleAtom, lyricBackgroundRendererAtom, lyricBackgroundStaticModeAtom, lyricFontFamilyAtom, lyricFontWeightAtom, lyricLetterSpacingAtom, lyricPlayerImplementationAtom, lyricSizePresetAtom, lyricWordFadeWidthAtom, musicAlbumNameAtom, musicArtistsAtom, musicCoverAtom, musicCoverIsVideoAtom, musicDurationAtom, musicIdAtom, musicLyricLinesAtom, musicNameAtom, musicPlayingAtom, musicPlayingPositionAtom, musicQualityAtom, musicQualityTagAtom, musicVolumeAtom, onChangeVolumeAtom, onClickAudioQualityTagAtom, onClickControlThumbAtom, onCycleRepeatModeAtom, onLyricLineClickAtom, onLyricLineContextMenuAtom, onPlayOrResumeAtom, onRequestNextSongAtom, onRequestOpenMenuAtom, onRequestPrevSongAtom, onSeekPositionAtom, onToggleShuffleAtom, playerControlsTypeAtom, repeatModeAtom, showBottomControlAtom, showMusicAlbumAtom, showMusicArtistsAtom, showMusicNameAtom, showRemainingTimeAtom, showVolumeControlAtom, toDuration, toggleShuffleActionAtom, verticalCoverLayoutAtom };

//# sourceMappingURL=amll-react-framework.mjs.map