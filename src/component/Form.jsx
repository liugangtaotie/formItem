import React, { Component } from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';
import FormCore from '../core/form';
import { STATUS_ENUMS, CHANGE, FOCUS, BLUR } from '../static';

const noop = () => {};

class Form extends Component {
    static defaultProps = {
        onChange: noop,
        onFocus: noop,
        onBlur: noop,
        onMount: noop,
        map: v => v,
        core: null,
        validateConfig: null,
        value: null,
        error: null,
        status: STATUS_ENUMS.EDIT,
        globalStatus: STATUS_ENUMS.EDIT,
        props: null,
    };
    static propTypes = {
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onMount: PropTypes.func,
        map: PropTypes.func,
        core: PropTypes.instanceOf(FormCore),
        validateConfig: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        value: PropTypes.object,
        error: PropTypes.object,
        status: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        globalStatus: PropTypes.string,
        props: PropTypes.object,
    };

    static contextTypes = {
        item: PropTypes.object,
    };

    static childContextTypes = {
        form: PropTypes.object,
    };

    constructor(props, context) {
        super(props, context);
        const { item } = context;

        // 初始化core
        if (props.core) {
            this.core = props.core;
        } else {
            // 无core则自定义生成不需要处理onChange, 使用jsx上的
            const { onChange, ...others } = props;
            this.core = new FormCore(others);
        }

        // 绑定事件和视图
        this.core.jsx = this;
        this.core.on(CHANGE, this.onChange);
        this.core.on(FOCUS, this.props.onFocus);
        this.core.on(BLUR, this.props.onBlur);

        // 嵌套Form
        if (item) this.item = item;
    }


    getChildContext() {
        // 传递form
        return { form: this.core };
    }
    componentDidMount() {
        const {
            validateConfig, map, value, core,
        } = this.props;
        this.props.onMount(this.core); // 返回core

        // 校验规则
        if ('validateConfig' in this.props && validateConfig) {
            this.core.setValidateConfig(validateConfig);
        } else if (core && 'validateConfig' in core && core.validateConfig) {
            this.core.setValidateConfig(core.validateConfig);
        }

        // 初始化赋值，map为格式化方法
        if ('value' in this.props && value) {
            this.core.setValueSilent(map(value));
        }

        // 静默更新初始化interceptor
        if (Object.keys(this.core.interceptor).length > 0) {
            this.core.setValueSilent({});
        }

        // 嵌套绑定当前form
        if (this.item) {
            this.item.bindForm(this.core);
        }

        // 强制渲染一次
        this.forceUpdate();
    }

    componentWillReceiveProps(nextProps) {
        // 根据属性来配置
        if (!deepEqual(nextProps.value, this.props.value)) {
            this.core.setValueSilent(nextProps.value);
        }
        if (!deepEqual(nextProps.props, this.props.props)) {
            this.core.setProps(nextProps.props);
        }
        if (!deepEqual(nextProps.status, this.props.status)) {
            this.core.setStatus(nextProps.status);
        }
        if (!deepEqual(nextProps.error, this.props.error)) {
            this.core.setError(nextProps.error);
        }
    }

    // 核心变化时，通知jsx属性绑定的onChange
    onChange = (val, fireKey) => {
        this.props.onChange(val, fireKey, this.core);
    };

    render() {
        // 默认布局为垂直布局
        const { children, className = '', direction = 'vertical' } = this.props;
        return <div className={`no-form no-form-${direction} ${className}`}>{children}</div>;
    }
}

Form.displayName = 'NoForm';

export default Form;
