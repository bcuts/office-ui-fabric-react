/* tslint:disable */
import * as React from 'react';
/* tslint:enable */
import { assign } from 'office-ui-fabric-react/lib/Utilities';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { ExtendedPeoplePicker } from '../PeoplePicker/ExtendedPeoplePicker';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { IPersonaWithMenu } from 'office-ui-fabric-react/lib/components/pickers/PeoplePicker/PeoplePickerItems/PeoplePickerItem.types';
import { people, mru, groupOne, groupTwo } from './PeopleExampleData';
import {
  SuggestionsStore,
  FloatingPeoplePicker,
  IBaseFloatingPickerProps,
  IBaseFloatingPickerSuggestionProps
} from '../../FloatingPicker';
import {
  IBaseSelectedItemsListProps,
  ISelectedPeopleProps,
  SelectedPeopleList,
  IExtendedPersonaProps
} from '../../SelectedItemsList';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import * as stylesImport from './ExtendedPeoplePicker.Basic.Example.scss';
// tslint:disable-next-line:no-any
const styles: any = stylesImport;

export interface IPeoplePickerExampleState {
  peopleList: IPersonaProps[];
  mostRecentlyUsed: IPersonaProps[];
  searchMoreAvailable: boolean;
  currentlySelectedItems: IExtendedPersonaProps[];
  suggestionItems: IPersonaProps[];
  controlledComponent: boolean;
}

// tslint:disable-next-line:no-any
export class ExtendedPeoplePickerTypesExample extends React.Component<{}, IPeoplePickerExampleState> {
  private _picker: ExtendedPeoplePicker;
  private _floatingPickerProps: IBaseFloatingPickerProps<IPersonaProps>;
  private _selectedItemsListProps: ISelectedPeopleProps;
  private _suggestionProps: IBaseFloatingPickerSuggestionProps;

  constructor(props: {}) {
    super(props);
    const peopleList: IPersonaWithMenu[] = [];
    people.forEach((persona: IPersonaProps) => {
      const target: IPersonaWithMenu = {};

      assign(target, persona);
      peopleList.push(target);
    });

    this.state = {
      peopleList: peopleList,
      mostRecentlyUsed: mru,
      searchMoreAvailable: true,
      currentlySelectedItems: [],
      controlledComponent: false,
      suggestionItems: []
    };

    this._suggestionProps = {
      headerItemsProps: [
        {
          renderItem: () => {
            return (
              <div className={styles.headerItem}>
                Use this address:{' '}
                {this._picker && this._picker.inputElement && this._picker.inputElement
                  ? this._picker.inputElement.value
                  : ''}
              </div>
            );
          },
          shouldShow: () => {
            return (
              this._picker !== undefined &&
              this._picker.inputElement !== null &&
              this._picker.inputElement.value.indexOf('@') > -1
            );
          },
          onExecute: () => {
            if (this._picker.floatingPicker.current !== null) {
              this._picker.floatingPicker.current.forceResolveSuggestion();
            }
          },
          ariaLabel: 'Use the typed address'
        },
        {
          renderItem: () => {
            return <div className={styles.headerItem}>Suggested Contacts</div>;
          },
          shouldShow: this._shouldShowSuggestedContacts
        }
      ],
      footerItemsProps: [
        {
          renderItem: () => {
            return <div className={styles.footerItem}>No results</div>;
          },
          shouldShow: () => {
            return (
              this._picker !== undefined &&
              this._picker.floatingPicker !== undefined &&
              this._picker.floatingPicker.current !== null &&
              this._picker.floatingPicker.current.suggestions.length === 0
            );
          }
        },
        {
          renderItem: () => {
            return <div className={styles.footerItem}>Search for more</div>;
          },
          onExecute: () => {
            this.setState({ searchMoreAvailable: false });
          },
          shouldShow: () => {
            return this.state.searchMoreAvailable && !this._shouldShowSuggestedContacts();
          },
          ariaLabel: 'Search more'
        }
      ],
      shouldSelectFirstItem: () => {
        return !this._shouldShowSuggestedContacts();
      }
    };

    this._floatingPickerProps = {
      suggestionsStore: new SuggestionsStore<IPersonaProps>(),
      onResolveSuggestions: this._onFilterChanged,
      getTextFromItem: this._getTextFromItem,
      pickerSuggestionsProps: this._suggestionProps,
      key: 'normal',
      onRemoveSuggestion: this._onRemoveSuggestion,
      onValidateInput: this._validateInput,
      onZeroQuerySuggestion: this._returnMostRecentlyUsed,
      showForceResolve: this._shouldShowForceResolve,
      onInputChanged: this._onInputChanged,
      onSuggestionsHidden: () => {
        console.log('FLOATINGPICKER: hidden');
      },
      onSuggestionsShown: () => {
        console.log('FLOATINGPICKER: shown');
      }
    };

    this._selectedItemsListProps = {
      onCopyItems: this._onCopyItems,
      onExpandGroup: this._onExpandItem,
      removeMenuItemText: 'Remove',
      copyMenuItemText: 'Copy name',
      editMenuItemText: 'Edit',
      getEditingItemText: this._getEditingItemText,
      onRenderFloatingPicker: this._onRenderFloatingPicker,
      floatingPickerProps: this._floatingPickerProps
    };
  }

  public render(): JSX.Element {
    return (
      <div>
        {this._renderExtendedPicker()}
        <Toggle label="Controlled component" defaultChecked={false} onChanged={this._toggleControlledComponent} />
        <PrimaryButton text="Set focus" onClick={this._onSetFocusButtonClicked} />
      </div>
    );
  }

  private _renderExtendedPicker(): JSX.Element {
    return (
      <ExtendedPeoplePicker
        selectedItems={this.state.controlledComponent ? this.state.currentlySelectedItems : undefined}
        suggestionItems={this.state.controlledComponent ? this.state.suggestionItems : undefined}
        onItemAdded={this.state.controlledComponent ? this._onItemAdded : undefined}
        onItemsRemoved={this.state.controlledComponent ? this._onItemsRemoved : undefined}
        floatingPickerProps={this._floatingPickerProps}
        selectedItemsListProps={this._selectedItemsListProps}
        onRenderFloatingPicker={this._onRenderFloatingPicker}
        onRenderSelectedItems={this._onRenderSelectedItems}
        className={'ms-PeoplePicker'}
        key={'normal'}
        inputProps={{
          onBlur: (ev: React.FocusEvent<HTMLInputElement>) => console.log('onBlur called'),
          onFocus: (ev: React.FocusEvent<HTMLInputElement>) => console.log('onFocus called'),
          'aria-label': 'People Picker'
        }}
        componentRef={this._setComponentRef}
        headerComponent={this._renderHeader()}
      />
    );
  }

  private _toggleControlledComponent = (toggleState: boolean): void => {
    this.setState({ controlledComponent: toggleState });
  };

  private _renderHeader(): JSX.Element {
    return <div>TO:</div>;
  }

  private _onRenderFloatingPicker(props: IBaseFloatingPickerProps<IPersonaProps>): JSX.Element {
    return <FloatingPeoplePicker {...props} />;
  }

  private _onRenderSelectedItems(props: IBaseSelectedItemsListProps<IExtendedPersonaProps>): JSX.Element {
    return <SelectedPeopleList {...props} />;
  }

  private _getEditingItemText(item: IExtendedPersonaProps): string {
    return item.text as string;
  }

  private _setComponentRef = (component: ExtendedPeoplePicker): void => {
    this._picker = component;
  };

  private _onSetFocusButtonClicked = (): void => {
    if (this._picker) {
      this._picker.focus();
    }
  };

  private _onExpandItem = (item: IExtendedPersonaProps): void => {
    if (this.state.controlledComponent) {
      const { currentlySelectedItems } = this.state;
      const indexToRemove = currentlySelectedItems.indexOf(item);
      const newItems = currentlySelectedItems;
      newItems.splice(indexToRemove, 1, ...this._getExpandedGroupItems(item));
      this.setState({ currentlySelectedItems: newItems });
    } else {
      if (this._picker.selectedItemsList.current) {
        // tslint:disable-next-line:no-any
        (this._picker.selectedItemsList.current as SelectedPeopleList).replaceItem(
          item,
          this._getExpandedGroupItems(item as any)
        );
      }
    }
  };

  private _onRemoveSuggestion = (item: IPersonaProps): void => {
    const { peopleList, mostRecentlyUsed: mruState } = this.state;
    const indexPeopleList: number = peopleList.indexOf(item);
    const indexMostRecentlyUsed: number = mruState.indexOf(item);

    if (indexPeopleList >= 0) {
      const newPeople: IPersonaProps[] = peopleList
        .slice(0, indexPeopleList)
        .concat(peopleList.slice(indexPeopleList + 1));
      this.setState({ peopleList: newPeople });
    }

    if (indexMostRecentlyUsed >= 0) {
      const newSuggestedPeople: IPersonaProps[] = mruState
        .slice(0, indexMostRecentlyUsed)
        .concat(mruState.slice(indexMostRecentlyUsed + 1));
      this.setState({ mostRecentlyUsed: newSuggestedPeople });
    }
  };

  private _onFilterChanged = (
    filterText: string,
    currentPersonas: IPersonaProps[],
    limitResults?: number
  ): Promise<IPersonaProps[]> | null => {
    const { controlledComponent } = this.state;
    let filteredPersonas: IPersonaProps[] = [];
    if (filterText) {
      filteredPersonas = this._filterPersonasByText(filterText);
      filteredPersonas = this._removeDuplicates(filteredPersonas, currentPersonas);
      filteredPersonas = limitResults ? filteredPersonas.splice(0, limitResults) : filteredPersonas;
    }

    if (controlledComponent) {
      this.setState({ suggestionItems: filteredPersonas });
    }
    return controlledComponent ? null : this._convertResultsToPromise(filteredPersonas);
  };

  private _returnMostRecentlyUsed = (
    currentPersonas: IPersonaProps[]
  ): IPersonaProps[] | Promise<IPersonaProps[]> | null => {
    const { controlledComponent } = this.state;
    let { mostRecentlyUsed } = this.state;
    mostRecentlyUsed = this._removeDuplicates(mostRecentlyUsed, this._picker.items);
    if (controlledComponent) {
      this.setState({ suggestionItems: mostRecentlyUsed });
    }
    return controlledComponent ? null : this._convertResultsToPromise(mostRecentlyUsed);
  };

  private _onCopyItems(items: IExtendedPersonaProps[]): string {
    let copyText = '';
    items.forEach((item: IExtendedPersonaProps, index: number) => {
      copyText += item.text;

      if (index < items.length - 1) {
        copyText += ', ';
      }
    });

    return copyText;
  }

  private _shouldShowForceResolve = (): boolean => {
    return Boolean(
      this._picker.floatingPicker.current &&
        this._validateInput(this._picker.floatingPicker.current.inputText) &&
        this._picker.floatingPicker.current.suggestions.length === 0
    );
  };

  private _shouldShowSuggestedContacts = (): boolean => {
    return this._picker !== undefined && this._picker.inputElement !== null && this._picker.inputElement.value === '';
  };

  private _listContainsPersona(persona: IPersonaProps, personas: IPersonaProps[]): boolean {
    if (!personas || !personas.length || personas.length === 0) {
      return false;
    }
    return personas.filter((item: IPersonaProps) => item.text === persona.text).length > 0;
  }

  private _filterPersonasByText(filterText: string): IPersonaProps[] {
    return this.state.peopleList.filter((item: IPersonaProps) =>
      this._doesTextStartWith(item.text as string, filterText)
    );
  }

  private _doesTextStartWith(text: string, filterText: string): boolean {
    return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
  }

  private _removeDuplicates(personas: IPersonaProps[], possibleDupes: IPersonaProps[]): IPersonaProps[] {
    return personas.filter((persona: IPersonaProps) => !this._listContainsPersona(persona, possibleDupes));
  }

  private _onInputChanged = (): void => {
    this.setState({ searchMoreAvailable: true });
  };

  private _getTextFromItem(persona: IPersonaProps): string {
    return persona.text as string;
  }

  private _convertResultsToPromise(results: IPersonaProps[]): Promise<IPersonaProps[]> {
    // tslint:disable-next-line:no-any
    return new Promise<IPersonaProps[]>((resolve: any, reject: any) => setTimeout(() => resolve(results), 150));
  }

  private _onItemAdded = (selectedSuggestion: IExtendedPersonaProps) => {
    this.setState({ currentlySelectedItems: this.state.currentlySelectedItems.concat(selectedSuggestion) });
  };

  private _onItemsRemoved = (items: IExtendedPersonaProps[]): void => {
    const newItems = this.state.currentlySelectedItems.filter(value => items.indexOf(value) === -1);
    this.setState({ currentlySelectedItems: newItems });
  };

  private _validateInput = (input: string): boolean => {
    if (input.indexOf('@') !== -1) {
      return true;
    } else if (input.length > 1) {
      return false;
    } else {
      return false;
    }
  };

  private _getExpandedGroupItems(item: IExtendedPersonaProps): IExtendedPersonaProps[] {
    switch (item.text) {
      case 'Group One':
        return groupOne;
      case 'Group Two':
        return groupTwo;
      default:
        return [];
    }
  }
}
