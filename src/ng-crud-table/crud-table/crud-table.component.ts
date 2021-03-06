import {Component, OnInit, ViewChild, Input, Output, EventEmitter, ViewEncapsulation, OnDestroy} from '@angular/core';
import {DataSource, Filter} from '../types';
import {ModalEditFormComponent} from '../modal-edit-form/modal-edit-form.component';
import {Settings} from '../base/settings';
import {ColumnBase} from '../base/column-base';
import {DataManager} from '../base/data-manager';
import {Message} from '../base/message';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-crud-table',
  templateUrl: './crud-table.component.html',
  styleUrls: ['../styles/index.css'],
  encapsulation: ViewEncapsulation.None,
})

export class CrudTableComponent implements OnInit, OnDestroy {

  @Input() public service: DataSource;
  @Input() public zIndexModal: number;
  @Output() select: EventEmitter<any> = new EventEmitter();

  @Input()
  set columns(val: ColumnBase[]) {
    this.dataManager.createColumns(val);
  }

  get columns(): ColumnBase[] {
    return this.dataManager.columns;
  }

  @Input()
  set settings(val: Settings) {
    this.dataManager.setSettings(val);
    this.dataManager.settings.clientSide = false;
  }

  get settings(): Settings {
    return this.dataManager.settings;
  }

  @Input()
  set messages(val: Message) {
    this.dataManager.setMessages(val);
  }

  get messages(): Message {
    return this.dataManager.messages;
  }

  public dataManager: DataManager;
  private subscriptions: Subscription[] = [];

  @ViewChild('modalEditForm') modalEditForm: ModalEditFormComponent;

  set filters(val: Filter) {
    this.dataManager.dataFilter.filters = val;
  }

  get filters(): Filter {
    return this.dataManager.dataFilter.filters;
  }

  constructor() {
    this.dataManager = new DataManager();
  }

  ngOnInit() {
    this.dataManager.setService(this.service);
    this.initRowMenu();
    if (this.dataManager.settings.initLoad) {
      this.dataManager.getItems().then();
    }

    const subSelection = this.dataManager.dataService.selectionSource$.subscribe(() => {
      this.onSelectedRow();
    });
    const subFilter = this.dataManager.dataService.filterSource$.subscribe(() => {
      this.onFilter();
    });
    const subSort = this.dataManager.dataService.sortSource$.subscribe(() => {
      this.onSort();
    });
    const subPage = this.dataManager.dataService.pageSource$.subscribe(() => {
      this.onPageChanged();
    });
    const subEdit = this.dataManager.dataService.editSource$.subscribe((row) => {
      this.onEditComplete(row);
    });
    const subRowMenu = this.dataManager.dataService.rowMenuSource$.subscribe((data) => {
      this.onRowMenu(data);
    });
    this.subscriptions.push(subSelection);
    this.subscriptions.push(subFilter);
    this.subscriptions.push(subSort);
    this.subscriptions.push(subPage);
    this.subscriptions.push(subEdit);
    this.subscriptions.push(subRowMenu);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  initRowMenu() {
    this.dataManager.actionMenu = [
      {
        label: this.dataManager.messages.titleDetailView,
        icon: 'icon icon-rightwards',
        command: 'view',
        disabled: !this.dataManager.settings.singleRowView
      },
      {
        label: this.dataManager.messages.titleUpdate,
        icon: 'icon icon-pencil',
        command: 'update',
        disabled: !this.dataManager.settings.crud
      }
    ];
  }

  onRowMenu(data: any) {
    if (data.menuItem.command === 'view') {
      this.viewAction(data.rowIndex);
    } else if (data.menuItem.command === 'update') {
      this.updateAction(data.rowIndex);
    }
  }

  createAction() {
    this.dataManager.clearItem();
    this.dataManager.detailView = false;
    this.modalEditForm.open();
  }

  viewAction(rowIndex: number) {
    this.dataManager.errors = null;
    this.dataManager.setItem(rowIndex);
    this.dataManager.detailView = true;
    this.modalEditForm.open();
  }

  updateAction(rowIndex: number) {
    this.dataManager.setItem(rowIndex);
    this.dataManager.detailView = false;
    this.modalEditForm.open();
  }

  onEditComplete(row: any) {
    this.dataManager.update(row);
  }

  onFilter() {
    this.dataManager.getItems().then();
  }

  onPageChanged() {
    this.dataManager.getItems().then();
  }

  onSort() {
    this.dataManager.getItems().then();
  }

  onSelectedRow() {
    this.select.emit(this.dataManager.getSelectedRows());
  }

  refresh() {
    this.dataManager.getItems().then();
  }

  clear() {
    this.dataManager.clear();
  }

  refreshSelectedRow() {
    this.dataManager.refreshSelectedRow();
  }

  globalFilter() {
    this.dataManager.dataFilter.filters = {};
    this.dataManager.dataFilter.isGlobal = true;
    this.dataManager.dataService.onFilter();
  }

  onClickGlobalSearch() {
    this.globalFilter();
  }

  onKeyPressGlobalSearch(event: KeyboardEvent) {
    if (event.which === 13) {
      this.globalFilter();
    }
  }

}
