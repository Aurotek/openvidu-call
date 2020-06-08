import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { UserModel } from '../../models/user-model';
import VRoomGame from './vroom_game';

@Component({
	selector: 'vroom-component',
	styleUrls: ['./vroom.component.css'],
	templateUrl: './vroom.component.html'
})
export class VirtualRoomComponent implements OnInit {
	@ViewChild('vroom') vroom: ElementRef;

	_localUsers: UserModel[] = [];

	_remoteUsers: UserModel[] = [];

	_vroomGame: VRoomGame = null;

	@Output() locationChanged = new EventEmitter<any>();

	@Input()
	set localUsers(users: UserModel[]) {
		this._localUsers = users;
	}

	@Input()
	set remoteUsers(users: UserModel[]) {
		this._remoteUsers = users;
		if (this._vroomGame) {
			this._vroomGame.setRemoteUsers(users);
		}
	}

	constructor() {}

	ngOnInit() {
		this._vroomGame = new VRoomGame('vroom-game', this._localUsers[0]);
		this._vroomGame.playerLocationChanged.subscribe(location => {
			this.locationChanged.emit({
				x: location.x,
				y: location.y,
				angle: location.angle
			});
		});
		this._vroomGame.events.once(Phaser.Core.Events.READY, () => {
			this._vroomGame.setRemoteUsers(this._remoteUsers);
		});
	}
}
