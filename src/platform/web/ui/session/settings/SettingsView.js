/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {TemplateView} from "../../general/TemplateView.js";
import {SessionBackupSettingsView} from "./SessionBackupSettingsView.js"

export class SettingsView extends TemplateView {
    render(t, vm) {
        let version = vm.version;
        if (vm.showUpdateButton) {
            version = t.span([
                vm.version,
                t.button({onClick: () => vm.checkForUpdate()}, vm.i18n`Check for updates`)
            ]);
        }

        const row = (label, content, extraClass = "") => {
            return t.div({className: `row ${extraClass}`}, [
                t.div({className: "label"}, label),
                t.div({className: "content"}, content),
            ]);
        };

        const settingNodes = [];

        settingNodes.push(
            t.h3("Session"),
            row(vm.i18n`User ID`, vm.userId),
            row(vm.i18n`Session ID`, vm.deviceId, "code"),
            row(vm.i18n`Session key`, vm.fingerprintKey, "code")
        );
        settingNodes.push(
            t.h3("Session Backup"),
            t.view(new SessionBackupSettingsView(vm.sessionBackupViewModel))
        );

        if (vm.supportsNotifications) {
            settingNodes.push(
                t.h3("Push notifications"),
                row(vm.i18n`Enable`, t.button({onClick: () => vm.enablePushNotifications()}, "Enable")),
            );
        }

        settingNodes.push(
            t.h3("Preferences"),
            row(vm.i18n`Scale down images when sending`, this._imageCompressionRange(t, vm)),
        );
        settingNodes.push(
            t.h3("Application"),
            row(vm.i18n`Version`, version),
            row(vm.i18n`Storage usage`, vm => `${vm.storageUsage} / ${vm.storageQuota}`),
            row(vm.i18n`Debug logs`, t.button({onClick: () => vm.exportLogs()}, "Export")),
            t.p(["Debug logs contain application usage data including your username, the IDs or aliases of the rooms or groups you have visited, the usernames of other users and the names of files you send. They do not contain messages. For more information, review our ",
                t.a({href: "https://element.io/privacy", target: "_blank", rel: "noopener"}, "privacy policy"), "."]),
        );

        return t.main({className: "Settings middle"}, [
            t.div({className: "middle-header"}, [
                t.a({className: "button-utility close-middle", href: vm.closeUrl, title: vm.i18n`Close settings`}),
                t.h2("Settings")
            ]),
            t.div({className: "SettingsBody"}, settingNodes)
        ]);
    }

    _imageCompressionRange(t, vm) {
        const step = 32;
        const min = Math.ceil(vm.minSentImageSizeLimit / step) * step;
        const max = (Math.floor(vm.maxSentImageSizeLimit / step) + 1) * step;
        const updateSetting = evt => vm.setSentImageSizeLimit(parseInt(evt.target.value, 10));
        return [t.input({
            type: "range",
            step,
            min,
            max,
            value: vm => vm.sentImageSizeLimit || max,
            onInput: updateSetting,
            onChange: updateSetting,
        }), " ", t.output(vm => {
            return vm.sentImageSizeLimit ? 
                vm.i18n`resize to ${vm.sentImageSizeLimit}px` :
                vm.i18n`no resizing`;
        })];
    }
}
