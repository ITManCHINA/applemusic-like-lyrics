import { getVelocity } from "./derivative.ts";

/** MIT License github.com/pushkine/ */
export interface SpringParams {
	mass: number; // = 1.0
	damping: number; // = 10.0
	stiffness: number; // = 100.0
	soft: boolean; // = false
}

type seconds = number;

interface SpringSolvers {
	x: (t: seconds) => number; // 位移公式
	v: (t: seconds) => number; // 速度（一阶导数）公式
	a: (t: seconds) => number; // 加速度（二阶导数）公式
}

export class Spring {
	private currentPosition = 0;
	private targetPosition = 0;
	private currentTime = 0;
	private params: Partial<SpringParams> = {};
	private currentSolver: (t: seconds) => number;
	private getV: (t: seconds) => number;
	private getV2: (t: seconds) => number;
	private queueParams:
		| (Partial<SpringParams> & {
			time: number;
		})
		| undefined;
	private queuePosition:
		| {
			time: number;
			position: number;
		}
		| undefined;
	constructor(currentPosition = 0) {
		this.targetPosition = currentPosition;
		this.currentPosition = this.targetPosition;
		this.currentSolver = () => this.targetPosition;
		this.getV = () => 0;
		this.getV2 = () => 0;
	}
	private resetSolver() {
		const curV = this.getV(this.currentTime);
		this.currentTime = 0;

		const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent);
		if (isMobile) {
			// 移动端采用无损高性能解析解求导，消除高频数值微分微量采样与闭包开销
			const solvers = solveSpringWithDerivatives(
				this.currentPosition,
				curV,
				this.targetPosition,
				0,
				this.params,
			);
			this.currentSolver = solvers.x;
			this.getV = solvers.v;
			this.getV2 = solvers.a;
		} else {
			// 桌面端完全还原原有的数值微分解求导逻辑，保证原效果不受影响
			this.currentSolver = solveSpring(
				this.currentPosition,
				curV,
				this.targetPosition,
				0,
				this.params,
			);
			this.getV = getVelocity(this.currentSolver);
			this.getV2 = getVelocity(this.getV);
		}
	}
	arrived(): boolean {
		return (
			Math.abs(this.targetPosition - this.currentPosition) < 0.01 &&
			this.getV(this.currentTime) < 0.01 &&
			this.getV2(this.currentTime) < 0.01 &&
			this.queueParams === undefined &&
			this.queuePosition === undefined
		);
	}
	setPosition(targetPosition: number): void {
		this.targetPosition = targetPosition;
		this.currentPosition = targetPosition;
		this.currentSolver = () => this.targetPosition;
		this.getV = () => 0;
		this.getV2 = () => 0;
	}
	update(delta = 0): void {
		this.currentTime += delta;
		this.currentPosition = this.currentSolver(this.currentTime);
		if (this.queueParams) {
			this.queueParams.time -= delta;
			if (this.queueParams.time <= 0) {
				this.updateParams({
					...this.queueParams,
				});
			}
		}
		if (this.queuePosition) {
			this.queuePosition.time -= delta;
			if (this.queuePosition.time <= 0) {
				this.setTargetPosition(this.queuePosition.position);
			}
		}
		if (this.arrived()) {
			this.setPosition(this.targetPosition);
		}
	}
	updateParams(params: Partial<SpringParams>, delay = 0): void {
		if (delay > 0) {
			this.queueParams = {
				...(this.queuePosition ?? {}),
				...params,
				time: delay,
			};
		} else {
			this.queuePosition = undefined;
			this.params = {
				...this.params,
				...params,
			};
			this.resetSolver();
		}
	}
	setTargetPosition(targetPosition: number, delay = 0): void {
		if (delay > 0) {
			this.queuePosition = {
				...(this.queuePosition ?? {}),
				position: targetPosition,
				time: delay,
			};
		} else {
			this.queuePosition = undefined;
			this.targetPosition = targetPosition;
			this.resetSolver();
		}
	}
	getCurrentPosition(): number {
		return this.currentPosition;
	}
}

function solveSpring(
	from: number,
	velocity: number,
	to: number,
	delay: seconds = 0,
	params?: Partial<SpringParams>,
): (t: seconds) => number {
	const soft = params?.soft ?? false;
	const stiffness = params?.stiffness ?? 100;
	const damping = params?.damping ?? 10;
	const mass = params?.mass ?? 1;
	const delta = to - from;
	if (soft || 1.0 <= damping / (2.0 * Math.sqrt(stiffness * mass))) {
		const angular_frequency = -Math.sqrt(stiffness / mass);
		const leftover = -angular_frequency * delta - velocity;
		return (t: seconds) => {
			t -= delay;
			if (t < 0) return from;
			return to - (delta + t * leftover) * Math.E ** (t * angular_frequency);
		};
	}
	const damping_frequency = Math.sqrt(4.0 * mass * stiffness - damping ** 2.0);
	const leftover =
		(damping * delta - 2.0 * mass * velocity) / damping_frequency;
	const dfm = (0.5 * damping_frequency) / mass;
	const dm = -(0.5 * damping) / mass;
	return (t: seconds) => {
		t -= delay;
		if (t < 0) return from;
		return (
			to -
			(Math.cos(t * dfm) * delta + Math.sin(t * dfm) * leftover) *
			Math.E ** (t * dm)
		);
	};
}

function solveSpringWithDerivatives(
	from: number,
	velocity: number,
	to: number,
	delay: seconds = 0,
	params?: Partial<SpringParams>,
): SpringSolvers {
	const soft = params?.soft ?? false;
	const stiffness = params?.stiffness ?? 100;
	const damping = params?.damping ?? 10;
	const mass = params?.mass ?? 1;
	const delta = to - from;
	if (soft || 1.0 <= damping / (2.0 * Math.sqrt(stiffness * mass))) {
		const angular_frequency = -Math.sqrt(stiffness / mass);
		const leftover = -angular_frequency * delta - velocity;
		return {
			x: (t: seconds) => {
				t -= delay;
				if (t < 0) return from;
				return to - (delta + t * leftover) * Math.E ** (t * angular_frequency);
			},
			v: (t: seconds) => {
				t -= delay;
				if (t < 0) return velocity;
				return -(leftover + (delta + t * leftover) * angular_frequency) * Math.E ** (t * angular_frequency);
			},
			a: (t: seconds) => {
				t -= delay;
				if (t < 0) return 0;
				const w = angular_frequency;
				return -(2 * leftover * w + (delta + t * leftover) * w * w) * Math.E ** (t * w);
			}
		};
	}
	const damping_frequency = Math.sqrt(4.0 * mass * stiffness - damping ** 2.0);
	const leftover =
		(damping * delta - 2.0 * mass * velocity) / damping_frequency;
	const dfm = (0.5 * damping_frequency) / mass;
	const dm = -(0.5 * damping) / mass;
	return {
		x: (t: seconds) => {
			t -= delay;
			if (t < 0) return from;
			return (
				to -
				(Math.cos(t * dfm) * delta + Math.sin(t * dfm) * leftover) *
					Math.E ** (t * dm)
			);
		},
		v: (t: seconds) => {
			t -= delay;
			if (t < 0) return velocity;
			const cosVal = Math.cos(t * dfm);
			const sinVal = Math.sin(t * dfm);
			const cVal = cosVal * delta + sinVal * leftover;
			const dcVal = -dfm * sinVal * delta + dfm * cosVal * leftover;
			return -(dcVal + cVal * dm) * Math.E ** (t * dm);
		},
		a: (t: seconds) => {
			t -= delay;
			if (t < 0) return 0;
			const cosVal = Math.cos(t * dfm);
			const sinVal = Math.sin(t * dfm);
			const cVal = cosVal * delta + sinVal * leftover;
			const dcVal = -dfm * sinVal * delta + dfm * cosVal * leftover;
			const d2cVal = -dfm * dfm * cosVal * delta - dfm * dfm * sinVal * leftover;
			return -(d2cVal + 2 * dcVal * dm + cVal * dm * dm) * Math.E ** (t * dm);
		}
	};
}
