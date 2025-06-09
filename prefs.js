import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


function getAllLayouts() {
    let settings = new Gio.Settings({ schema: 'org.gnome.desktop.input-sources' });
    let sources = settings.get_value('sources').deep_unpack();
    return sources.map(([type, id]) => id);
}

export default class ExamplePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Layouts'),
        });
        page.add(group);

        // Create a settings object and bind the row to the `show-indicator` key
        window._settings = this.getSettings();
        
        const layouts = getAllLayouts();
        const active1 = layouts.indexOf(window._settings.get_string('layout1'));
        const active2 = layouts.indexOf(window._settings.get_string('layout2'));

        const row1 = new Adw.ActionRow({ title: 'First Layout' });
        const dropdown1 = Gtk.DropDown.new_from_strings(layouts);
        dropdown1.set_selected(active1 >= 0 ? active1 : 0);
        dropdown1.connect('notify::selected', () => {
            const selected = dropdown1.get_selected();
            if (selected >= 0) window._settings.set_string('layout1', layouts[selected]);
        });
        row1.add_suffix(dropdown1);
        row1.activatable_widget = dropdown1;
        group.add(row1);


        const row2 = new Adw.ActionRow({ title: 'Second Layout' });
        const dropdown2 = Gtk.DropDown.new_from_strings(layouts);
        dropdown2.set_selected(active2 >= 0 ? active2 : 1);
        dropdown2.connect('notify::selected', () => {
            const selected = dropdown2.get_selected();
            if (selected >= 0) window._settings.set_string('layout2', layouts[selected]);
        });
        row2.add_suffix(dropdown2);
        row2.activatable_widget = dropdown2;
        group.add(row2);
        
    }
}
