import React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import {ContactIDStr} from '../../datastore/sharing/db/Contacts';
import {Contact} from '../../datastore/sharing/db/Contacts';
import {EmailStr} from '../../util/Strings';
import {ProfileIDStr} from '../../datastore/sharing/db/Profiles';
import {NULL_FUNCTION} from '../../util/Functions';
import {EmailAddresses} from '../../util/EmailAddresses';

/**
 * Allow the user to select from one or more of their contacts.
 */
export class ContactsSelector extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.onPaste = this.onPaste.bind(this);

        this.state = {
            selectedOptions: this.props.selectedOptions || []
        };

    }

    public render() {

        function convertToOptions(contacts: ReadonlyArray<ContactOption>) {
            return contacts.map(current => {
                return {
                    value: current.value,
                    label: current.label
                };
            });
        }

        const options = convertToOptions(this.props.options || []);
        const selectedOptions = convertToOptions(this.state.selectedOptions);

        return <div onPaste={event => this.onPaste(event)}>
            <CreatableSelect

                isMulti
                isClearable
                autoFocus
                // onKeyDown={event => this.onKeyDown(event)}
                // className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selectedOptions) => this.handleChange(selectedOptions as ReadonlyArray<ContactOption>)}
                value={selectedOptions}
                defaultValue={selectedOptions}
                placeholder="Enter names or email addresses"
                options={options}>

            </CreatableSelect>

        </div>;

    }

    private onPaste(event: React.ClipboardEvent<HTMLDivElement>) {

        event.preventDefault();

        const text = event.clipboardData.getData('text/plain');

        const emailAddresses = EmailAddresses.parseList(text);

        const newContacts: ContactOption[] = emailAddresses.map(current => {

            return {
                value: current.address,
                label: EmailAddresses.format(current)
            };

        });

        this.setState({
            ...this.state,
            selectedOptions: [...this.state.selectedOptions, ...newContacts]
        });

    }

    private handleChange(selectedOptions: ReadonlyArray<ContactOption>) {
        this.setState({...this.state, selectedOptions});

        const onChange = this.props.onChange || NULL_FUNCTION;

        onChange(ContactOptions.toContactSelections(selectedOptions));

    }

}

interface IProps {
    readonly options?: ReadonlyArray<ContactOption>;
    readonly selectedOptions?: ReadonlyArray<ContactOption>;
    readonly onChange?: (contactSelections: ReadonlyArray<ContactSelection>) => void;
}

interface IState {
    readonly selectedOptions: ReadonlyArray<ContactOption>;
}

export interface ContactOption {
    readonly value: ContactIDStr;
    readonly label: string;
}

export interface ContactSelection {
    readonly value: EmailStr | ProfileIDStr;
    readonly type: 'email' | 'profileID';
}

export class ContactOptions {

    public static fromContacts(contacts: ReadonlyArray<Contact> = []) {

        return contacts.map(current => {

            if (current.profileID) {

                return {
                    value: current.profileID,
                    // FIXME: this isn't a good value to put in the UI.
                    label: current.profileID
                };

            } else if (current.email) {

                return {
                    value: current.email.toLowerCase(),
                    label: current.email
                };

            } else {
                throw new Error("No email or profileID");
            }

        });

    }

    public static toContactSelections(options: ReadonlyArray<ContactOption> = []): ReadonlyArray<ContactSelection> {

        return options.map(current => {

            if (current.value.indexOf("@") !== -1) {

                return {
                    value: current.label,
                    type: 'email'
                };

            }

            return {
                value: current.label,
                type: 'profileID'
            };

        });

    }

}