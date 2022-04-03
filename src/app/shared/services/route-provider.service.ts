import {Injectable} from '@angular/core';
import {EntryType} from "@shared/models";

interface EntryRouteDef {
  name: string
  path: string
  type: EntryType
  icon?: string
}

@Injectable({
  providedIn: 'root'
})
export class RouteProviderService {

  readonly baseEntryPath = "/entries";
  readonly groupsPath = "/groups";
  readonly notificationsPath = "/notifications";
  readonly loginPath = "/auth/login";

  readonly entryDefsByType: { [key in EntryType]?: EntryRouteDef } = {
    [EntryType.ENTRIES]: {name: "Entries", path: this.baseEntryPath, type: EntryType.ENTRIES, icon: "table"},
    [EntryType.LINK]: {name: "Links", path: `${this.baseEntryPath}/links`, type: EntryType.LINK, icon: "link"},
    [EntryType.NOTE]: {name: "Notes", path: `${this.baseEntryPath}/notes`, type: EntryType.NOTE, icon: "book"},
    [EntryType.SNIPPET]: {
      name: "Snippets",
      path: `${this.baseEntryPath}/snippets`,
      type: EntryType.SNIPPET,
      icon: "sticky-note"
    }
  };

  get entryDefs(): EntryRouteDef[] {
    return Object.values(this.entryDefsByType);
  }

  readonly createEntryByType: { [key in EntryType]?: EntryRouteDef } = {
    [EntryType.LINK]: {name: "Link", path: `${this.baseEntryPath}/links/create`, type: EntryType.LINK},
    [EntryType.NOTE]: {name: "Note", path: `${this.baseEntryPath}/notes/create`, type: EntryType.NOTE},
    [EntryType.SNIPPET]: {name: "Snippet", path: `${this.baseEntryPath}/snippets/create`, type: EntryType.SNIPPET}
  }

  get createEntryItems(): EntryRouteDef[] {
    return Object.values(this.createEntryByType);
  }

}
