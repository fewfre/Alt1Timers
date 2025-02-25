import { mount, unmount, type Component, type ComponentType, type MountOptions, type SvelteComponent } from "svelte";

async function _openNewBlankWindowAndWaitToLoad(pTitle:string, pWidth:number, pHeight:number) : Promise<WindowProxy> {
	const tWindow = window.open('about:blank', pTitle, `width=${pWidth},height=${pHeight},resizable,scrollbars=yes,status=1, popup, toolbar=no, menubar=no, location=no, addressbar=no`)!;
	// Make sure window has loaded so we know if we can modify it yet (needed for firefox)
	await new Promise<WindowProxy>(resolve => {
		if(tWindow?.document.readyState === 'complete') { resolve(tWindow); }
		else { tWindow?.addEventListener('load', ()=>resolve(tWindow), true); }
	});
	tWindow.document.title = pTitle;
	return tWindow;
}

// Based heavily on https://stackoverflow.com/questions/58187495/create-window-with-attached-svelte-component-and-in-the-same-javascript-context
export class ComponentWindow {
	private readonly _windowOptions: any[]
	private _window: WindowProxy | null = null;
	private _container?: HTMLDivElement;

	constructor({
		windowName = '',
		windowFeatures = '',
		replace = false,
	}: {
		windowName?: string,
		windowFeatures?: string,
		replace?: boolean,
	} = {}) {
		this._windowOptions = [ 'about:blank', windowName, windowFeatures, replace ]
	}

	// region create window

	public get window() { return this._window; }
	
	public async openWindow(pTitle:string, pWidth:number, pHeight:number) : Promise<this> {
		if (window.alt1) pHeight -= 40; // Since alt1 doesn't include title bar, remove the height it would have used
		const tWindow = this._window = await _openNewBlankWindowAndWaitToLoad(pTitle, pWidth, pHeight);
		this.appendCss(tWindow);
		this.appendContainer(tWindow);
		return this;
	}

	// Take css from the current page we are on and copy it to the new window
	private appendCss(pWindow:WindowProxy) {
		const parentStyleElements = Array.from(window.document.querySelectorAll(
			'link[rel="stylesheet"], link[rel="icon"], style',
		));

		for (let i = 0; i < parentStyleElements.length; i++) {
			const parentStyleElement = parentStyleElements[i]
			let styleElement;
			switch (parentStyleElement.tagName) {
				case 'LINK':
					styleElement = pWindow.document.createElement('link');
					styleElement.rel = (parentStyleElement as HTMLLinkElement).rel;
					styleElement.href = (parentStyleElement as HTMLLinkElement).href;
					break;
				case 'STYLE':
					styleElement = pWindow.document.createElement('style');
					styleElement.id = parentStyleElement.id;
					styleElement.innerHTML = parentStyleElement.innerHTML;
					break;
				default:
					throw new Error('Unexpected style element: ' + parentStyleElement.tagName);
			}
			pWindow.document.head.appendChild(styleElement)
		}
	}

	private appendContainer(pWindow:WindowProxy) {
		this._container = window?.document.createElement('div');
		this._container.style.width = '100vw';
		this._container.style.height = '100vh';
		pWindow.document.body.appendChild(this._container!);
	}

    // endregion

    // region attachComponent

    private _component?: SvelteComponent;
    // public attachComponent<T extends SvelteComponent>(ComponentClass:T, options?) : T {
    public mountComponent<Props extends Record<string, any>, Exports extends Record<string, any>>(ComponentClass:ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>, options?:Omit<MountOptions<Props>, 'target'>) : SvelteComponent<Props> {
        this._unmountComponent();

		this._component = mount(ComponentClass as ComponentType<SvelteComponent<any>>, { target: this._container!, ...options });
		this.focus();
		
        this.window?.addEventListener('beforeunload', () => {
            this._unmountComponent();
        })

        return this._component as SvelteComponent<Props>;
    }
	
	private _unmountComponent() : void {
        if (this._component) {
			unmount(this._component);
            this._component = undefined;
        }
	}

    // endregion

    public get isOpened() {
        return this._window && !this._window.closed
    }

    public focus() {
        if (this.isOpened) {
            this._window?.focus()
        }
    }

    public closeWindow() { this.destroy(); }

    public destroy() {
        this._unmountComponent()
        if (this.isOpened) {
            this._window?.close()
            this._window = null
        }
    }
}