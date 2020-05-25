import { StreamManager, Publisher } from 'openvidu-browser';
import { VideoType } from '../types/video-type';

export class UserLocation {
	/**
	 * User location: x
	 */
	x: number;

	/**
	 * User location: y
	 */
	y: number;

	constructor() {
		this.x = 0;
		this.y = 0;
	}

	update(x, y) {
		this.x = x;
		this.y = y;
	}
}

/**
 * Packs all the information about the user
 */
export class UserModel {
	/**
	 * The Connection ID that is publishing the stream
	 */
	connectionId: string;

	/**
	 * The user nickname
	 */
	nickname: string;

	/**
	 * StreamManager object ([[Publisher]] or [[Subscriber]])
	 */
	streamManager: StreamManager;

	/**
	 * Location of user
	 */
	location: UserLocation;

	/**
	 * @hidden
	 */
	videoAvatar: HTMLCanvasElement;

	/**
	 * @hidden
	 */
	private randomAvatar: string;

	/**
	 * @hidden
	 */
	private videoSizeBig: boolean;

	/**
	 * @hidden
	 */
	private audioVolume: number;

	/**
	 * @hidden
	 */
	constructor(
		connectionId?: string,
		streamManager?: StreamManager,
		nickname?: string,
	) {
		this.connectionId = connectionId || '';
		this.nickname = nickname || 'OpenVidu';
		this.streamManager = streamManager || null;
		this.location = new UserLocation();
		this.audioVolume = 1.0;
	}

	/**
	 * Return `true` if audio track is active and `false` if audio track is muted
	 */
	public isAudioActive(): boolean {
		// console.log("isAudioActive");
		return (<Publisher>this.streamManager)?.stream?.audioActive;
	}

	/**
	 * Return `true` if video track is active and `false` if video track is muted
	 */
	public isVideoActive(): boolean {
		// console.log("isVideoActive");
		return (<Publisher>this.streamManager)?.stream?.videoActive;
	}

	/**
	 * Return the connection ID
	 */
	public getConnectionId(): string {
		return this.streamManager?.stream?.connection?.connectionId;
	}

	/**
	 * Return the user nickname
	 */
	public getNickname(): string {
		return this.nickname;
	}

	/**
	 * Return the [[streamManger]] object
	 */
	public getStreamManager(): StreamManager {
		return this.streamManager;
	}

	/**
	 * Return the user avatar
	 */
	public getAvatar(): string {
		return this.videoAvatar ? this.videoAvatar.toDataURL() : this.randomAvatar;
	}

	/**
	 * Return `true` if user has a local role and `false` if not
	 */
	public isLocal(): boolean {
		return !this.isRemote();
	}

	/**
	 * Return `true` if user has a remote role and `false` if not
	 */
	public isRemote(): boolean {
		return (<Publisher>this.streamManager)?.remote;
	}

	/**
	 * Return `true` if user has a screen role and `false` if not
	 */
	public isScreen(): boolean {
		// console.log("isScreen");
		return (<Publisher>this.streamManager)?.stream?.typeOfVideo === VideoType.SCREEN;
	}

	/**
	 * Return `true` if user has a camera role and `false` if not
	 */
	public isCamera(): boolean {
		// console.log("CCC");
		return (<Publisher>this.streamManager)?.stream?.typeOfVideo === VideoType.CAMERA || (this.isLocal() && !this.isScreen());
	}

	/**
	 * Set the streamManager value object
	 * @param streamManager value of streamManager
	 */
	public setStreamManager(streamManager: StreamManager) {
		this.streamManager = streamManager;
	}

	/**
	 * Set the user nickname value
	 * @param nickname value of user nickname
	 */
	public setNickname(nickname: string) {
		this.nickname = nickname;
	}

	/**
	 * Set the user location value
	 * @param x value of x
	 * @param y value of y
	 */
	public setLocation(x: number, y: number) {
		this.location.update(x, y);
	}

	/**
	 * Get the user location value
	 * @return UserLocation
	 */
	public getLocation(): UserLocation {
		return this.location;
	}

	public isVideoSizeBig(): boolean {
		return this.videoSizeBig;
	}

	/**
	 * @hidden
	 */
	public setVideoSizeBig(big: boolean) {
		this.videoSizeBig = big;
	}

	public getAudioVolume(): number {
		return this.audioVolume;
	}

	public setAudioVolume(audioVolume: number) {
		this.audioVolume = audioVolume;
	}

	/**
	 * @hidden
	 */
	public setUserAvatar(img?: string): Promise<any> {
		return new Promise(resolve => {
			if (!img) {
				this.createVideoAvatar();
				const video = <HTMLVideoElement>document.getElementById('video-' + this.getStreamManager().stream.streamId);
				const avatar = this.videoAvatar.getContext('2d');
				avatar.drawImage(video, 200, 120, 285, 285, 0, 0, 100, 100);
				resolve();
			} else {
				this.randomAvatar = img;
				resolve();
			}
		});
	}

	public removeVideoAvatar() {
		this.videoAvatar = null;
	}

	/**
	 * @hidden
	 */
	private createVideoAvatar() {
		this.videoAvatar = document.createElement('canvas');
		this.videoAvatar.className = 'user-img';
		this.videoAvatar.width = 100;
		this.videoAvatar.height = 100;
	}
}
