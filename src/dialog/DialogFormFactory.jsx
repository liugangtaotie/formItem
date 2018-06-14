import React from 'react';
import PropTypes from 'prop-types';

const noop = () => {};
const isPromise = content => Promise.resolve(content) === content;


class DialogForm {
    constructor(options, getDialogInstance) {
        this.options = options;
        this.dialogCore = null;
        this.getDialogInstance = getDialogInstance;
    }

    hide = () => {
        const dialogInstance = this.getDialogInstance();
        dialogInstance.hide();
    };

    handleOk = () => {
        const { onOk = noop, enableValidate } = this.options;
        let values = {};
        if (this.dialogCore) values = this.dialogCore.getValues();

        const params = [values, this.hide, this.dialogCore];
        if (enableValidate && this.dialogCore) {
            return this.dialogCore.validate((err) => {
                if (!err) return onOk(...params);
                return null;
            });
        }
        return onOk(...params);
    };

    renderFooter = (Button) => {
        const { footer, okText = 'OK', btnLoadingPropsName } = this.options;

        let footerElement = null;
        if (footer) {
            footerElement = footer(this.hide);
        } else {
            footerElement = (
                <div key="footer" className="ant-custom-btns">
                    <ActionButton btnLoadingPropsName={btnLoadingPropsName} btnOrigin={Button} type="primary" onClick={this.handleOk}>{okText}</ActionButton>
                </div>);
        }

        return footerElement;
    }

    renderContent = async (Button) => {
        const { content } = this.options;

        let formInstance = null;
        if (typeof content === 'function') {
            formInstance = content();
        } else if (isPromise(content)) { // promise
            formInstance = await content;
        } else {
            formInstance = content;
        }

        const formInstanceProps = formInstance.props;
        const { onMount, children } = formInstanceProps;

        const hijackCore = (core) => {
            this.dialogCore = core;
            if (onMount) {
                onMount(core);
            }
        };

        const footer = this.renderFooter(Button);
        const mixFooterContent = [].concat(children, footer);
        const modalContent = React.cloneElement(formInstance, {
            ...formInstanceProps,
            onMount: hijackCore,
            children: mixFooterContent,
        });

        return modalContent;
    }
}

export default class DialogFormFactory {
    constructor({ Dialog, Button, compatiMap }) {
        this.Dialog = Dialog;
        this.Button = Button;
        this.compatiMap = compatiMap;
    }
    show = async (options) => {
        const { Dialog, Button, compatiMap } = this;
        if (!Dialog || !Button) {
            throw Error('DialogForm initialize failed, make sure you have passed antd components');
        }
        const {
            title, className, width, ...others
        } = options;
        let dialogInstance = null;

        // 按钮loading属性
        const btnLoadingPropsName = compatiMap.btnLoadingProps || 'loading';

        const dialogForm = new DialogForm({
            ...options,
            btnLoadingPropsName,
        }, () => dialogInstance);
        const content = await dialogForm.renderContent(Button);

        // 入口属性
        const entryProps = compatiMap.show({
            ...options,
            title,
            content,
        });

        dialogInstance = Dialog.show({
            ...others,
            ...entryProps,
        });

        dialogInstance = compatiMap.dialogInstance(dialogInstance);
        return dialogInstance;
    }
}

class ActionButton extends React.Component {
    static propTypes = {
        onLoading: PropTypes.func,
        offLoading: PropTypes.func,
        onClick: PropTypes.func,
        btnLoadingPropsName: PropTypes.string,
        btnOrigin: PropTypes.oneOf([PropTypes.func, PropTypes.string]),
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            isLoading: false,
        };
    }

    enableLoading = () => {
        const { onLoading } = this.props;
        if (onLoading) {
            onLoading();
        }
        this.setState({ isLoading: true });
    }
    disableLoading = () => {
        const { offLoading } = this.props;
        if (offLoading) {
            offLoading();
        }
        this.setState({ isLoading: false });
    }

    handleAction = () => {
        const { onClick } = this.props;
        if (typeof onClick === 'function') {
            this.enableLoading();
            const actionResult = onClick();
            if (isPromise(actionResult)) {
                actionResult
                    .then(this.disableLoading, this.disableLoading)
                    .catch(this.disableLoading);
            } else {
                this.disableLoading();
            }
        }
    }

    render() {
        const {
            onClick, btnLoadingPropsName = 'loading', btnOrigin, ...others
        } = this.props;
        const Button = btnOrigin;
        const { isLoading } = this.state;
        const btnLoadingProps = { [btnLoadingPropsName]: isLoading };
        return <Button onClick={this.handleAction} {...others} {...btnLoadingProps} />;
    }
}
