/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface IGirruCodeBridge {
 review(): Promise<{id:string;path:string;before:string;after:string}|null>;
 decideReview(id:string,decision:'approve'|'deny'):Promise<boolean>;
 onReview(callback:()=>void):()=>void;
	target(): Promise<{ id: number; folder: string; file: string | null } | null>;
	targetDone(id: number): Promise<boolean>;
	onTarget(callback: () => void): () => void;
	pickDirectory(): Promise<string | null>;
	footer(): Promise<{ id: string; label: string }[]>;
	navigate(id: string): Promise<boolean>;
}

declare global {
	interface Window { girruCode?: IGirruCodeBridge; }
}
