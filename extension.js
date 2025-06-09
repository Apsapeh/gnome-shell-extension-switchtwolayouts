// SPDX-License-Identifier: MIT OR GPL-2.0-or-later
// Copyright (c) 2021-2023 Maxim Mikityanskiy

import GObject from 'gi://GObject';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Keyboard from 'resource:///org/gnome/shell/ui/status/keyboard.js';
import * as KeyboardManager from 'resource:///org/gnome/shell/misc/keyboardManager.js';

const signalId = 'modifiers-accelerator-activated';

function patchedModifiersSwitcher(manager, settings) {
	return () => {
		let layout1 = settings.get_string('layout1');
		let layout2 = settings.get_string('layout2');

		let sources = Object.values(manager._inputSources).filter(source =>
			source.id === layout1 || source.id === layout2
		);

		if (sources.length < 2) {
			KeyboardManager.releaseKeyboard();
			return true;
		}

		let current = manager._currentSource.id;

		if (current === layout1)
			sources.find(s => s.id === layout2)?.activate(true);
		else
			sources.find(s => s.id === layout1)?.activate(true);

		return true;
	};
}

export default class SwitchTwoLayoutsExtension extends Extension {
	enable() {
		this._settings = this.getSettings();
		this._inputSourceManager = Keyboard.getInputSourceManager();

		// Switch to the first layout on start
		const layout1 = this._settings.get_string('layout1');
		const source = Object.values(this._inputSourceManager._inputSources)
			.find(s => s.id === layout1);
		if (source)
			source.activate(true);

		// Find the original handler and block it
		this.realHandlerId = GObject.signal_handler_find(global.display, {
			signalId: signalId,
		});

		if (this.realHandlerId)
			global.display.block_signal_handler(this.realHandlerId);

		this.patchedHandlerId = global.display.connect(
			signalId,
			patchedModifiersSwitcher(this._inputSourceManager, this._settings)
		);
	}

	disable() {
		if (this.patchedHandlerId)
			global.display.disconnect(this.patchedHandlerId);

		if (this.realHandlerId)
			global.display.unblock_signal_handler(this.realHandlerId);
	}
}
