// SPDX-License-Identifier: MIT OR GPL-2.0-or-later
// Copyright (c) 2021-2023 Maxim Mikityanskiy

import GObject from 'gi://GObject';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Keyboard from 'resource:///org/gnome/shell/ui/status/keyboard.js';
import * as KeyboardManager from 'resource:///org/gnome/shell/misc/keyboardManager.js';

const signalId = 'modifiers-accelerator-activated';

function patchedModifiersSwitcher() {
	let sourceIndexes = Object.keys(this._inputSources);
	if (sourceIndexes.length < 2) {
		KeyboardManager.releaseKeyboard();
		return true;
	}

	let sources = [
		this._inputSources[sourceIndexes[0]],
		this._inputSources[sourceIndexes[1]],
	];

	if (this._currentSource == sources[0])
		sources[1].activate(true);
	else
		sources[0].activate(true);
	return true;
}

export default class SwitchTwoLayoutsExtension extends Extension {
	constructor(metadata) {
		super(metadata);
		this.realHandlerId = GObject.signal_handler_find(global.display, { signalId: signalId });
	}

	enable() {
		global.display.block_signal_handler(this.realHandlerId);
		this.patchedHandlerId = global.display.connect(signalId, patchedModifiersSwitcher.bind(Keyboard.getInputSourceManager()));
	}

	disable() {
		global.display.disconnect(this.patchedHandlerId);
		global.display.unblock_signal_handler(this.realHandlerId);
	}
}
