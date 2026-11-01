/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import '../../base/browser/girruDesktop.js';
import { addDisposableListener, getActiveWindow } from '../../base/browser/dom.js';
import { CommandsRegistry } from '../../platform/commands/common/commands.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../common/contributions.js';
import { IStatusbarService, StatusbarAlignment } from '../services/statusbar/browser/statusbar.js';
import { Disposable, toDisposable } from '../../base/common/lifecycle.js';

import { IWorkspaceContextService } from '../../platform/workspace/common/workspace.js';
import { IHostService } from '../services/host/browser/host.js';
import { IEditorService } from '../services/editor/common/editorService.js';
import { IWorkbenchEnvironmentService } from '../services/environment/common/environmentService.js';
import { URI } from '../../base/common/uri.js';
import { Schemas } from '../../base/common/network.js';
import { isDiffEditor } from '../../editor/browser/editorBrowser.js';
import { IModelService } from '../../editor/common/services/model.js';
import { ITextModelService } from '../../editor/common/services/resolverService.js';
import { INotificationService, Severity, INotificationHandle } from '../../platform/notification/common/notification.js';
import { isEqual } from '../../base/common/resources.js';


const icons: Record<string, string> = { chat: 'comment-discussion', agents: 'organization', library: 'library', board: 'project', memory: 'database', approvals: 'shield', store: 'extensions', terminal: 'terminal', code: 'code', genvr: 'globe', skills: 'sparkle', personalities: 'smiley', specialties: 'layers', settings: 'gear' };

class GirruStatusbar extends Disposable {
	constructor(@IStatusbarService statusbar: IStatusbarService, @IWorkspaceContextService workspace: IWorkspaceContextService, @IHostService host: IHostService, @IEditorService editor: IEditorService, @IWorkbenchEnvironmentService environment: IWorkbenchEnvironmentService, @IModelService models: IModelService, @ITextModelService resolver: ITextModelService, @INotificationService notifications: INotificationService) {
		super();
		const bridge = getActiveWindow().girruCode;
		if (!bridge) { return; }
        let reviewId = '', reviewNotification: INotificationHandle | undefined;
        const contents = new Map<string,string>();
        this._register(resolver.registerTextModelContentProvider('girru-review', { provideTextContent: async uri => {
            const text = contents.get(uri.toString());
            return text === undefined ? null : models.getModel(uri) ?? models.createModel(text, null, uri);
        }}));
        let reviewSequence = 0;
        const openReview = async () => {
            const sequence = ++reviewSequence;
            const value = await bridge.review();
            if (sequence !== reviewSequence || this._store.isDisposed) { return; }
            if (!value) { reviewId = ''; reviewNotification?.close(); reviewNotification = undefined; return; }
            reviewId = value.id; reviewNotification?.close();
            const original = URI.from({scheme:'girru-review',path:`/${value.id}/Before/${value.path}`});
            const modified = URI.from({scheme:'girru-review',path:`/${value.id}/After/${value.path}`});
            contents.set(original.toString(),value.before); contents.set(modified.toString(),value.after);
            const pane = await editor.openEditor({original:{resource:original},modified:{resource:modified},label:`${value.path} · Proposed change`,options:{pinned:true}});
            const control = pane?.getControl(); if (isDiffEditor(control)) { control.updateOptions({readOnly:true,originalEditable:false,renderSideBySide:true}); }
            if (sequence !== reviewSequence || this._store.isDisposed || reviewId !== value.id) { return; }
            const decide = async (decision:'approve'|'deny') => {
                if (reviewId !== value.id) { return; }
                const accepted = await bridge.decideReview(value.id,decision);
                if (accepted) { reviewId = ''; reviewNotification?.close(); }
            };
            reviewNotification = notifications.prompt(Severity.Info,`${value.path}: review the red removed text and green added text. The file is unchanged until you apply.`,[
                {label:'Apply change',run:()=>decide('approve')},
                {label:'Reject change',run:()=>decide('deny')}
            ],{sticky:true});
        };
        this._register(toDisposable(bridge.onReview(()=>{void openReview().catch(()=>{});})));
        this._register(toDisposable(()=>{reviewNotification?.close();contents.clear();}));
        void openReview().catch(()=>{});
		let processing = false, queued = false;
		const resource = (value: string) => URI.file(value).with({ scheme: environment.remoteAuthority ? Schemas.vscodeRemote : Schemas.file, authority: environment.remoteAuthority });
		const openTarget = async () => {
			if (processing) { queued = true; return; }
			processing = true;
			try {
				const target = await bridge.target();
				if (!target || this._store.isDisposed) { return; }
				const folder = resource(target.folder);
				if (!workspace.getWorkspace().folders.some(f => isEqual(f.uri, folder))) {
					await host.openWindow([{ folderUri: folder }], { forceReuseWindow: true, remoteAuthority: environment.remoteAuthority });
					return;
				}
				if (target.file) { await editor.openEditor({ resource: resource(target.file), options: { pinned: true } }); }
				await bridge.targetDone(target.id);
			} finally {
				processing = false;
				if (queued && !this._store.isDisposed) { queued = false; void openTarget().catch(() => {}); }
			}
		};
		this._register(toDisposable(bridge.onTarget(() => { void openTarget().catch(() => {}); })));
		void openTarget().catch(() => {});
		void bridge.footer().then(items => {
			if (this._store.isDisposed) { return; }
			for (const [index, item] of items.entries()) {
				if (!Object.hasOwn(icons, item.id)) { continue; }
				const command = `girru.footer.${item.id}`;
				this._register(CommandsRegistry.registerCommand(command, () => bridge.navigate(item.id)));
				const value = { name: item.label, text: '', ariaLabel: item.label, tooltip: `Girru · ${item.label}`, command };
				const entry = this._register(statusbar.addEntry(value, command, StatusbarAlignment.LEFT, 1000000 - index));
				const resize = () => entry.update({ ...value, text: `$(${icons[item.id]})${getActiveWindow().innerWidth >= 1050 ? ` ${item.label}` : ''}` });
				resize();
				this._register(addDisposableListener(getActiveWindow(), 'resize', resize));
			}
		}).catch(() => {});
	}
}

registerWorkbenchContribution2('girru.statusbar', GirruStatusbar, WorkbenchPhase.AfterRestored);
