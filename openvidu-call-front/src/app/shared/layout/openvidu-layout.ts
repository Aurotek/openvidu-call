/**
 * @hidden
 */
declare var $: any;

export interface OpenViduLayoutOptions {
	/**
	 * The narrowest ratio that will be used (*2x3* by default)
	 */
	maxRatio: number;

	/**
	 * The widest ratio that will be used (*16x9* by default)
	 */
	minRatio: number;

	/**
	 * If this is true then the aspect ratio of the video is maintained and minRatio and maxRatio are ignored (*false* by default)
	 */
	fixedRatio: boolean;
	/**
	 * Whether you want to animate the transitions
	 */
	animate: any;
	/**
	 * The class to add to elements that should be sized bigger
	 */
	bigClass: string;

	/**
	 * The maximum percentage of space the big ones should take up
	 */
	bigPercentage: any;

	/**
	 * FixedRatio for the big ones
	 */
	bigFixedRatio: any;

	/**
	 * The narrowest ratio to use for the big elements (*2x3* by default)
	 */
	bigMaxRatio: any;

	/**
	 * The widest ratio to use for the big elements (*16x9* by default)
	 */
	bigMinRatio: any;

	/**
	 * Whether to place the big one in the top left `true` or bottom right
	 */
	bigFirst: any;

	/**
	 * Whether vroom
	 */
	vroom: boolean;
}

export class OpenViduLayout {
	/**
	 * @hidden
	 */
	private layoutContainer: HTMLElement;

	/**
	 * @hidden
	 */
	private opts: OpenViduLayoutOptions;

	/**
	 * Update the layout container
	 */
	updateLayout() {
		setTimeout(() => {
			if (this.layoutContainer.style.display === 'none') {
				return;
			}
			let id = this.layoutContainer.id;
			if (!id) {
				id = 'OT_' + this.cheapUUID();
				this.layoutContainer.id = id;
			}

			const HEIGHT =
				this.getHeight(this.layoutContainer) -
				this.getCSSNumber(this.layoutContainer, 'borderTop') -
				this.getCSSNumber(this.layoutContainer, 'borderBottom');
			const WIDTH =
				this.getWidth(this.layoutContainer) -
				this.getCSSNumber(this.layoutContainer, 'borderLeft') -
				this.getCSSNumber(this.layoutContainer, 'borderRight');

			const availableRatio = HEIGHT / WIDTH;

			let offsetLeft = 0;
			let offsetTop = 0;
			let bigOffsetTop = 0;
			let bigOffsetLeft = 0;

			const bigOnes = Array.prototype.filter.call(
				this.layoutContainer.querySelectorAll('#' + id + '>.' + this.opts.bigClass),
				this.filterDisplayNone
			);
			const smallOnes = Array.prototype.filter.call(
				this.layoutContainer.querySelectorAll('#' + id + '>*:not(.' + this.opts.bigClass + ')'),
				this.filterDisplayNone
			);

			if (bigOnes.length > 0 && smallOnes.length > 0) {
				let bigWidth, bigHeight;

				if (availableRatio > this.getVideoRatio(bigOnes[0])) {
					// We are tall, going to take up the whole width and arrange small
					// guys at the bottom
					bigWidth = WIDTH;
					bigHeight = Math.floor(HEIGHT * this.opts.bigPercentage);
					offsetTop = bigHeight;
					bigOffsetTop = HEIGHT - offsetTop;
				} else {
					// We are wide, going to take up the whole height and arrange the small
					// guys on the right
					bigHeight = HEIGHT;
					bigWidth = Math.floor(WIDTH * this.opts.bigPercentage);
					offsetLeft = bigWidth;
					bigOffsetLeft = WIDTH - offsetLeft;
				}
				if (this.opts.bigFirst) {
					this.arrange(
						bigOnes,
						bigWidth,
						bigHeight,
						0,
						0,
						this.opts.bigFixedRatio,
						this.opts.bigMinRatio,
						this.opts.bigMaxRatio,
						this.opts.animate,
						this.opts.vroom
					);
					this.arrange(
						smallOnes,
						WIDTH - offsetLeft,
						HEIGHT - offsetTop,
						offsetLeft,
						offsetTop,
						this.opts.fixedRatio,
						this.opts.minRatio,
						this.opts.maxRatio,
						this.opts.animate,
						this.opts.vroom
					);
				} else {
					this.arrange(
						smallOnes,
						WIDTH - offsetLeft,
						HEIGHT - offsetTop,
						0,
						0,
						this.opts.fixedRatio,
						this.opts.minRatio,
						this.opts.maxRatio,
						this.opts.animate,
						this.opts.vroom
					);
					this.arrange(
						bigOnes,
						bigWidth,
						bigHeight,
						bigOffsetLeft,
						bigOffsetTop,
						this.opts.bigFixedRatio,
						this.opts.bigMinRatio,
						this.opts.bigMaxRatio,
						this.opts.animate,
						this.opts.vroom
					);
				}
			} else if (bigOnes.length > 0 && smallOnes.length === 0) {
				this
					// We only have one bigOne just center it
					.arrange(
						bigOnes,
						WIDTH,
						HEIGHT,
						0,
						0,
						this.opts.bigFixedRatio,
						this.opts.bigMinRatio,
						this.opts.bigMaxRatio,
						this.opts.animate,
						this.opts.vroom
					);
			} else {
				this.arrange(
					smallOnes,
					WIDTH - offsetLeft,
					HEIGHT - offsetTop,
					offsetLeft,
					offsetTop,
					this.opts.fixedRatio,
					this.opts.minRatio,
					this.opts.maxRatio,
					this.opts.animate,
					this.opts.vroom
				);
			}
		}, 50);
	}

	/**
	 * Initialize the layout inside of the container with the options required
	 * @param container
	 * @param opts
	 */
	initLayoutContainer(container: HTMLElement, opts: OpenViduLayoutOptions) {
		this.opts = {
			maxRatio: opts.maxRatio != null ? opts.maxRatio : 3 / 2,
			minRatio: opts.minRatio != null ? opts.minRatio : 9 / 16,
			fixedRatio: opts.fixedRatio != null ? opts.fixedRatio : false,
			animate: opts.animate != null ? opts.animate : false,
			bigClass: opts.bigClass != null ? opts.bigClass : 'OT_big',
			bigPercentage: opts.bigPercentage != null ? opts.bigPercentage : 0.8,
			bigFixedRatio: opts.bigFixedRatio != null ? opts.bigFixedRatio : false,
			bigMaxRatio: opts.bigMaxRatio != null ? opts.bigMaxRatio : 3 / 2,
			bigMinRatio: opts.bigMinRatio != null ? opts.bigMinRatio : 9 / 16,
			bigFirst: opts.bigFirst != null ? opts.bigFirst : true,
			vroom: opts.vroom != null ? opts.vroom : false
		};
		this.layoutContainer = typeof container === 'string' ? $(container) : container;
	}

	/**
	 * Set the layout configuration
	 * @param options
	 */
	setLayoutOptions(options: OpenViduLayoutOptions) {
		this.opts = options;
	}

	/**
	 * @hidden
	 */
	private fixAspectRatio(elem: HTMLVideoElement, width: number) {
		const sub: HTMLVideoElement = <HTMLVideoElement>elem.querySelector('.OT_root');
		if (sub) {
			// If this is the parent of a subscriber or publisher then we need
			// to force the mutation observer on the publisher or subscriber to
			// trigger to get it to fix it's layout
			const oldWidth = sub.style.width;
			sub.style.width = width + 'px';
			// sub.style.height = height + 'px';
			sub.style.width = oldWidth || '';
		}
	}

	/**
	 * @hidden
	 */
	private positionElement(elem: HTMLVideoElement, x: number, y: number, width: number, height: number, animate: any) {
		const targetPosition = {
			left: x + 'px',
			top: y + 'px',
			width: width + 'px',
			height: height + 'px'
		};

		this.fixAspectRatio(elem, width);

		if (animate && $) {
			$(elem).stop();
			$(elem).animate(targetPosition, animate.duration || 200, animate.easing || 'swing', () => {
				this.fixAspectRatio(elem, width);
				if (animate.complete) {
					animate.complete.call(this);
				}
			});
		} else {
			$(elem).css(targetPosition);
		}
		this.fixAspectRatio(elem, width);
	}

	/**
	 * @hidden
	 */
	private getVideoRatio(elem: HTMLVideoElement) {
		if (!elem) {
			return 3 / 4;
		}
		const video: HTMLVideoElement = <HTMLVideoElement>elem.querySelector('video');
		if (video && video.videoHeight && video.videoWidth) {
			return video.videoHeight / video.videoWidth;
		} else if (elem.videoHeight && elem.videoWidth) {
			return elem.videoHeight / elem.videoWidth;
		}
		return 3 / 4;
	}

	/**
	 * @hidden
	 */
	private getCSSNumber(elem: HTMLElement, prop: string) {
		const cssStr = $(elem).css(prop);
		return cssStr ? parseInt(cssStr, 10) : 0;
	}

	/**
	 * @hidden
	 */
	// Really cheap UUID function
	private cheapUUID() {
		return (Math.random() * 100000000).toFixed(0);
	}

	/**
	 * @hidden
	 */
	private getHeight(elem: HTMLElement) {
		const heightStr = $(elem).css('height');
		return heightStr ? parseInt(heightStr, 10) : 0;
	}

	/**
	 * @hidden
	 */
	private getWidth(elem: HTMLElement) {
		const widthStr = $(elem).css('width');
		return widthStr ? parseInt(widthStr, 10) : 0;
	}

	/**
	 * @hidden
	 */
	private getBestDimensions(minR: number, maxR: number, count: number, WIDTH: number, HEIGHT: number, targetHeight: number) {
		let maxArea, targetCols, targetRows, targetWidth, tWidth, tHeight, tRatio;

		// Iterate through every possible combination of rows and columns
		// and see which one has the least amount of whitespace
		for (let i = 1; i <= count; i++) {
			const colsAux = i;
			const rowsAux = Math.ceil(count / colsAux);

			// Try taking up the whole height and width
			tHeight = Math.floor(HEIGHT / rowsAux);
			tWidth = Math.floor(WIDTH / colsAux);

			tRatio = tHeight / tWidth;
			if (tRatio > maxR) {
				// We went over decrease the height
				tRatio = maxR;
				tHeight = tWidth * tRatio;
			} else if (tRatio < minR) {
				// We went under decrease the width
				tRatio = minR;
				tWidth = tHeight / tRatio;
			}

			const area = tWidth * tHeight * count;

			// If this width and height takes up the most space then we're going with that
			if (maxArea === undefined || area > maxArea) {
				maxArea = area;
				targetHeight = tHeight;
				targetWidth = tWidth;
				targetCols = colsAux;
				targetRows = rowsAux;
			}
		}
		return {
			maxArea: maxArea,
			targetCols: targetCols,
			targetRows: targetRows,
			targetHeight: targetHeight,
			targetWidth: targetWidth,
			ratio: targetHeight / targetWidth
		};
	}

	/**
	 * @hidden
	 */
	private arrange(
		children: HTMLVideoElement[],
		WIDTH: number,
		HEIGHT: number,
		offsetLeft: number,
		offsetTop: number,
		fixedRatio: boolean,
		minRatio: number,
		maxRatio: number,
		animate: any,
		vroom: boolean
	) {
		let targetHeight;

		const count = children.length;
		let dimensions;

		if (!fixedRatio) {
			dimensions = this.getBestDimensions(minRatio, maxRatio, count, WIDTH, HEIGHT, targetHeight);
		} else {
			// Use the ratio of the first video element we find to approximate
			const ratio = this.getVideoRatio(children.length > 0 ? children[0] : null);
			dimensions = this.getBestDimensions(ratio, ratio, count, WIDTH, HEIGHT, targetHeight);
		}

		// Loop through each stream in the container and place it inside
		let x = 0,
			y = 0;
		const rows = [];
		let row;
		// Iterate through the children and create an array with a new item for each row
		// and calculate the width of each row so that we know if we go over the size and need
		// to adjust
		for (let i = 0; i < children.length; i++) {
			if (i % dimensions.targetCols === 0) {
				// This is a new row
				row = {
					children: [],
					width: 0,
					height: 0
				};
				rows.push(row);
			}
			const elem: HTMLVideoElement = children[i];
			const ovVideoComponent = elem.querySelector('ov-video[data-audio-volume]');
			const child = {
				elem,
				width: dimensions.targetWidth,
				height: dimensions.targetHeight,
				vroomRatio: ovVideoComponent != null ?
					// TODO: The video disappears if the video size is 0 at the beginning.
					Math.max(0.1, parseFloat(ovVideoComponent.getAttribute('data-audio-volume'))) : 1
			};
			// If we're using a fixedRatio then we need to set the correct ratio for this element
			if (fixedRatio) {
				child.width = child.height / this.getVideoRatio(elem);
			}
			row.children.push(child);
			row.width += child.width;
			row.height = child.height;
		}
		// Calculate total row height adjusting if we go too wide
		let totalRowHeight = 0;
		let remainingShortRows = 0;
		for (let i = 0; i < rows.length; i++) {
			row = rows[i];
			if (row.width > WIDTH) {
				// Went over on the width, need to adjust the height proportionally
				row.height = Math.floor(row.height * (WIDTH / row.width));
				row.width = WIDTH;
			} else if (row.width < WIDTH) {
				remainingShortRows += 1;
			}
			totalRowHeight += row.height;
		}
		if (totalRowHeight < HEIGHT && remainingShortRows > 0) {
			// We can grow some of the rows, we're not taking up the whole height
			let remainingHeightDiff = HEIGHT - totalRowHeight;
			totalRowHeight = 0;
			for (let i = 0; i < rows.length; i++) {
				row = rows[i];
				if (row.width < WIDTH) {
					// Evenly distribute the extra height between the short rows
					let extraHeight = remainingHeightDiff / remainingShortRows;
					if (extraHeight / row.height > (WIDTH - row.width) / row.width) {
						// We can't go that big or we'll go too wide
						extraHeight = Math.floor(((WIDTH - row.width) / row.width) * row.height);
					}
					row.width += Math.floor((extraHeight / row.height) * row.width);
					row.height += extraHeight;
					remainingHeightDiff -= extraHeight;
					remainingShortRows -= 1;
				}
				totalRowHeight += row.height;
			}
		}
		// Adjust size according to vroom ratio
		if (vroom) {
			let baseWidth = 0;
			let totalHeightRatio = 0;
			for (const r of rows) {
				const totalWidthRatio = r.children.reduce((total, child) => total + child.vroomRatio, 0);
				const totalWidth = r.children.reduce((total, child) => total + child.width, 0);
				if (totalWidthRatio > 0 && baseWidth < totalWidth) {
					baseWidth = totalWidth / totalWidthRatio;
				}
				totalHeightRatio += r.children.reduce((max, child) => Math.max(max, child.vroomRatio), 0);
			}
			const baseHeight = HEIGHT / totalHeightRatio;
			for (const r of rows) {
				for (const child of r.children) {
					child.width = baseWidth * child.vroomRatio;
					child.height = baseHeight * child.vroomRatio;
				}
			}
			for (const r of rows) {
				r.width = r.children.reduce((total, child) => total + child.width, 0);
				r.height = r.children.reduce((max, child) => Math.max(max, child.height), 0);
			}
		}
		// vertical centering
		totalRowHeight = rows.reduce((total, r) => total + r.height, 0);
		y = (HEIGHT - totalRowHeight) / 2;
		// Iterate through each row and place each child
		for (let i = 0; i < rows.length; i++) {
			row = rows[i];
			// center the row
			const rowMarginLeft = (WIDTH - row.width) / 2;
			x = rowMarginLeft;
			for (let j = 0; j < row.children.length; j++) {
				const elem: HTMLVideoElement = row.children[j].elem;

				let targetWidth = row.children[j].width;
				targetHeight = row.children[j].height;
				// If we're using a fixedRatio then we need to set the correct ratio for this element
				if (fixedRatio) {
					targetWidth = Math.floor(targetHeight / this.getVideoRatio(elem));
				}
				elem.style.position = 'absolute';
				// $(elem).css('position', 'absolute');
				const actualWidth =
					targetWidth -
					this.getCSSNumber(elem, 'paddingLeft') -
					this.getCSSNumber(elem, 'paddingRight') -
					this.getCSSNumber(elem, 'marginLeft') -
					this.getCSSNumber(elem, 'marginRight') -
					this.getCSSNumber(elem, 'borderLeft') -
					this.getCSSNumber(elem, 'borderRight');

				const actualHeight =
					targetHeight -
					this.getCSSNumber(elem, 'paddingTop') -
					this.getCSSNumber(elem, 'paddingBottom') -
					this.getCSSNumber(elem, 'marginTop') -
					this.getCSSNumber(elem, 'marginBottom') -
					this.getCSSNumber(elem, 'borderTop') -
					this.getCSSNumber(elem, 'borderBottom');

				const offsetTop2 = (row.height - targetHeight) / 2;

				this.positionElement(elem, x + offsetLeft, y + offsetTop + offsetTop2, actualWidth, actualHeight, animate);
				x += targetWidth;
			}
			y += row.height;
		}
	}

	/**
	 * @hidden
	 */
	private filterDisplayNone(element: HTMLElement) {
		return element.style.display !== 'none';
	}
}
