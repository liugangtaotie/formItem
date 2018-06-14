import * as Antd from 'antd';
import { mount } from 'enzyme';
import React from 'react';
import Form, { FormItem, Item, FormCore } from '../../src';
import ReactTestUtils from 'react-dom/test-utils';
import repeaterWrapper from '../../src/repeater';
import wrapper from '../../src/wrapper/antd';
import dialogWrapper from '../../src/dialog/antd';

const { InlineRepeater } = repeaterWrapper({ ...Antd, Dialog: dialogWrapper(Antd) });

const { Input } = wrapper(Antd);
function filter(value, key) {
    return value.filter(item => item.drawerName.startsWith(key));
}

function sleep(timer) {
    return new Promise((resolve) => {
        setTimeout(resolve, timer);
    });
}

const testValues = {
    drawerName: '开票人',
    taxpayerNumber: '税号',
    branchName: '子公司',
    checkResultName: '核查结果',
    denyReason: '拒绝原因',
    creatorName: '创建人',
};

describe('Inline Repeater', () => {
    let form = null;
    let formCore = null;
    function formmount(core) {
        formCore = core;
    }
    beforeEach(() => {
        form = mount(<Form onMount={formmount}>
            <Item name="repeat">
                <InlineRepeater filter={filter}>
                    <FormItem label="开票人" name="drawerName"><Input /></FormItem>
                    <FormItem label="税号" name="taxpayerNumber"><Input /></FormItem>
                    <FormItem label="子公司" name="branchName"><Input /></FormItem>
                    <FormItem label="核查结果" name="checkResultName"><Input /></FormItem>
                    <FormItem label="拒绝原因" name="denyReason"><Input /></FormItem>
                    <FormItem label="创建人" name="creatorName"><Input /></FormItem>
                </InlineRepeater>
            </Item>
        </Form>);
    });
    it('should render', () => {
        formCore.setValue('repeat', [{}]);
    });
    it('should add', () => {
        // console.log(form.find(InlineRepeater).instance().doAdd);
        form.find(InlineRepeater).instance().doAdd(testValues);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([testValues]));
    });
    it('should update', () => {
        // console.log(form.find(InlineRepeater).instance().doAdd);
        form.find(InlineRepeater).instance().doAdd(testValues);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([testValues]));

        form.find(InlineRepeater).instance().doUpdate({
            ...testValues,
            drawerName: 'xxxxx',
        }, 0);

        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([{
            ...testValues,
            drawerName: 'xxxxx',
        }]));
    });
    it('should delete', () => {
        form.find(InlineRepeater).instance().doAdd(testValues);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([testValues]));

        form.find(InlineRepeater).instance().doDelete(0);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([]));
    });

    it('should add by click save button', async () => {
        expect(formCore.getValue('repeat')).toEqual(null);
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        form.find('button.repeater-add').simulate('click');
        await sleep(500);
        form.mount();
        expect(form.find('button.repeater-save').length).toEqual(1);
        expect(form.find('button.repeater-cancel').length).toEqual(1);
        ReactTestUtils.Simulate.click(form.find('button.repeater-save').getDOMNode());

        await sleep(500);
        form.mount();
        expect(formCore.getValue('repeat').length).toEqual(1);
    });

    it('should update by click save button', async () => {
        expect(formCore.getValue('repeat')).toEqual(null);
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        form.find(InlineRepeater).instance().doAdd(testValues);
        form.find(InlineRepeater).instance().doAdd(testValues);
        form.mount();
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        expect(form.find('button.repeater-update').length).toEqual(2);
        expect(form.find('button.repeater-delete').length).toEqual(2);
        expect(formCore.getValue('repeat')).toEqual([testValues, testValues]);

        form.find('button.repeater-update').at(1).simulate('click');
        await sleep(500);
        form.mount();
        expect(form.find('button.repeater-save').length).toEqual(1);
        expect(form.find('button.repeater-cancel').length).toEqual(1);
        expect(form.find('button.repeater-update').length).toEqual(1);
        expect(form.find('button.repeater-delete').length).toEqual(1);
        ReactTestUtils.Simulate.click(form.find('button.repeater-save').getDOMNode());

        await sleep(500);
        form.mount();
        expect(formCore.getValue('repeat').length).toEqual(2);
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        expect(form.find('button.repeater-update').length).toEqual(2);
        expect(form.find('button.repeater-delete').length).toEqual(2);
    });

    it('shouldnt update by click cancel button', async () => {
        expect(formCore.getValue('repeat')).toEqual(null);
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        form.find(InlineRepeater).instance().doAdd(testValues);
        form.find(InlineRepeater).instance().doAdd(testValues);
        form.mount();
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        expect(form.find('button.repeater-update').length).toEqual(2);
        expect(form.find('button.repeater-delete').length).toEqual(2);
        expect(formCore.getValue('repeat')).toEqual([testValues, testValues]);

        form.find('button.repeater-update').at(1).simulate('click');
        await sleep(500);
        form.mount();
        expect(form.find('button.repeater-save').length).toEqual(1);
        expect(form.find('button.repeater-cancel').length).toEqual(1);
        expect(form.find('button.repeater-update').length).toEqual(1);
        expect(form.find('button.repeater-delete').length).toEqual(1);
        ReactTestUtils.Simulate.click(form.find('button.repeater-cancel').getDOMNode());

        await sleep(500);
        form.mount();
        expect(formCore.getValue('repeat').length).toEqual(2);
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        expect(form.find('button.repeater-update').length).toEqual(2);
        expect(form.find('button.repeater-delete').length).toEqual(2);
    });

    it('should only one node is focus when click add', async () => {
        expect(formCore.getValue('repeat')).toEqual(null);
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        form.find('button.repeater-add').simulate('click');
        await sleep(500);
        form.mount();
        expect(form.find('button.repeater-save').length).toEqual(1);
        expect(form.find('button.repeater-cancel').length).toEqual(1);
        ReactTestUtils.Simulate.click(form.find('button.repeater-save').getDOMNode());

        await sleep(500);
        form.mount();
        expect(formCore.getValue('repeat').length).toEqual(1);
    });

    it('should only one node is focus when click update', async () => {
        expect(formCore.getValue('repeat')).toEqual(null);
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        form.find('button.repeater-add').simulate('click');
        await sleep(500);
        form.mount();
        expect(form.find('button.repeater-save').length).toEqual(1);
        expect(form.find('button.repeater-cancel').length).toEqual(1);
        ReactTestUtils.Simulate.click(form.find('button.repeater-save').getDOMNode());

        await sleep(500);
        form.mount();
        expect(formCore.getValue('repeat').length).toEqual(1);
    });

    it('should save(validate fail) when last node is editing when click save', async () => {
        const validateConfig = {
            drawerName: { type: 'string', required: true },
        };
        let validateCore = null;
        function validateMount(core) {
            validateCore = core;
        }
        const validateForm = mount(<Form onMount={validateMount}>
            <Item name="repeat">
                <InlineRepeater filter={filter} validateConfig={validateConfig}>
                    <FormItem label="开票人" name="drawerName"><Input /></FormItem>
                    <FormItem label="税号" name="taxpayerNumber"><Input /></FormItem>
                    <FormItem label="子公司" name="branchName"><Input /></FormItem>
                    <FormItem label="核查结果" name="checkResultName"><Input /></FormItem>
                    <FormItem label="拒绝原因" name="denyReason"><Input /></FormItem>
                    <FormItem label="创建人" name="creatorName"><Input /></FormItem>
                </InlineRepeater>
            </Item>
        </Form>);

        expect(validateCore.getValue('repeat')).toEqual(null);
        expect(validateForm.find('button.repeater-save').length).toEqual(0);
        expect(validateForm.find('button.repeater-cancel').length).toEqual(0);
        validateForm.find('button.repeater-add').simulate('click');
        await sleep(500);
        validateForm.mount();
        expect(validateForm.find('button.repeater-save').length).toEqual(1);
        expect(validateForm.find('button.repeater-cancel').length).toEqual(1);
        ReactTestUtils.Simulate.click(validateForm.find('button.repeater-add').getDOMNode());

        await sleep(500);
        validateForm.mount();
        expect(validateCore.getValue('repeat')).toEqual(null);
        expect(validateForm.find('.no-form-item-error').length).toEqual(1);
        ReactTestUtils.Simulate.change(validateForm.find('.inline-repeater-focus input[name="drawerName"]').getDOMNode(), {
            target: {
                value: 'hello world',
            },
        });

        await sleep(500);
        validateForm.mount();
        ReactTestUtils.Simulate.click(validateForm.find('button.repeater-add').getDOMNode());
        await sleep(500);
        validateForm.mount();
        expect(validateForm.find('.no-form-item-error').length).toEqual(0);
        expect(validateCore.getValue('repeat').length).toEqual(1);
    });

    it('should auto save(validate fail) when last node is editing when click save', async () => {
        const validateConfig = {
            drawerName: { type: 'string', required: true },
        };
        let validateCore = null;
        function validateMount(core) {
            validateCore = core;
        }
        const validateForm = mount(<Form onMount={validateMount}>
            <Item name="repeat">
                <InlineRepeater filter={filter} validateConfig={validateConfig}>
                    <FormItem label="开票人" name="drawerName"><Input /></FormItem>
                    <FormItem label="税号" name="taxpayerNumber"><Input /></FormItem>
                    <FormItem label="子公司" name="branchName"><Input /></FormItem>
                    <FormItem label="核查结果" name="checkResultName"><Input /></FormItem>
                    <FormItem label="拒绝原因" name="denyReason"><Input /></FormItem>
                    <FormItem label="创建人" name="creatorName"><Input /></FormItem>
                </InlineRepeater>
            </Item>
        </Form>);

        expect(validateCore.getValue('repeat')).toEqual(null);
        expect(validateForm.find('button.repeater-save').length).toEqual(0);
        expect(validateForm.find('button.repeater-cancel').length).toEqual(0);
        validateForm.find('button.repeater-add').simulate('click');
        await sleep(500);
        validateForm.mount();
        expect(validateForm.find('button.repeater-save').length).toEqual(1);
        expect(validateForm.find('button.repeater-cancel').length).toEqual(1);
        ReactTestUtils.Simulate.click(validateForm.find('button.repeater-save').getDOMNode());

        await sleep(500);
        validateForm.mount();
        expect(validateCore.getValue('repeat')).toEqual(null);
        expect(validateForm.find('.no-form-item-error').length).toEqual(1);
        ReactTestUtils.Simulate.change(validateForm.find('.inline-repeater-focus input[name="drawerName"]').getDOMNode(), {
            target: {
                value: 'hello world',
            },
        });

        await sleep(500);
        validateForm.mount();
        ReactTestUtils.Simulate.click(validateForm.find('button.repeater-save').getDOMNode());
        await sleep(500);
        validateForm.mount();
        expect(validateForm.find('.no-form-item-error').length).toEqual(0);
        expect(validateCore.getValue('repeat').length).toEqual(1);
    });

    it('should auto save(no validation) when last node is editing when click save', async () => {
        expect(formCore.getValue('repeat')).toEqual(null);
        expect(form.find('button.repeater-save').length).toEqual(0);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        form.find('button.repeater-add').simulate('click');
        await sleep(500);
        form.mount();
        expect(form.find('button.repeater-save').length).toEqual(1);
        expect(form.find('button.repeater-cancel').length).toEqual(1);
        ReactTestUtils.Simulate.click(form.find('button.repeater-save').getDOMNode());

        await sleep(500);
        form.mount();
        expect(formCore.getValue('repeat').length).toEqual(1);
    });

    it('shouldnt add by click cancel button', async () => {
        expect(formCore.getValue('repeat')).toEqual(null);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        expect(form.find('button.repeater-save').length).toEqual(0);
        form.find('button.repeater-add').simulate('click');
        await sleep(500);
        form.mount();
        expect(form.find('button.repeater-cancel').length).toEqual(1);
        expect(form.find('button.repeater-save').length).toEqual(1);
        ReactTestUtils.Simulate.click(form.find('button.repeater-cancel').getDOMNode());

        await sleep(500);
        form.mount();
        expect(formCore.getValue('repeat').length).toEqual(0);
    });

    it('shouldnt update by click cancel button', async () => {
        expect(formCore.getValue('repeat')).toEqual(null);
        expect(form.find('button.repeater-cancel').length).toEqual(0);
        expect(form.find('button.repeater-save').length).toEqual(0);
        form.find('button.repeater-add').simulate('click');
        await sleep(500);
        form.mount();
        expect(form.find('button.repeater-cancel').length).toEqual(1);
        expect(form.find('button.repeater-save').length).toEqual(1);
        ReactTestUtils.Simulate.click(form.find('button.repeater-cancel').getDOMNode());

        await sleep(500);
        form.mount();
        expect(formCore.getValue('repeat').length).toEqual(0);
    });

    it('should update by click update', async () => {
        form.find(InlineRepeater).instance().doAdd(testValues);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([testValues]));
        expect(formCore.getValue('repeat').length).toEqual(1);
        expect(form.find('button.repeater-save').length).toEqual(0);
        await sleep(500);
        form.mount();
        form.find('button.repeater-update').simulate('click');

        await sleep(500);
        form.mount();
        expect(form.find('button.repeater-save').length).toEqual(1);
        ReactTestUtils.Simulate.change(form.find('.inline-repeater-focus input[name="drawerName"]').getDOMNode(), {
            target: {
                value: 'hello world',
            },
        });

        form.find('button.repeater-save').simulate('click');
        await sleep(500);
        form.mount();
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([{
            ...testValues,
            drawerName: 'hello world',
        }]));
    });

    it('should delete by click delete', async () => {
        form.find(InlineRepeater).instance().doAdd({
            drawerName: '开票人',
            taxpayerNumber: '税号',
            branchName: '子公司',
            checkResultName: '核查结果',
            denyReason: '拒绝原因',
            creatorName: '创建人',
        });
        form.mount();
        await sleep(500);
        form.find('.repeater-delete').simulate('click');

        expect(JSON.stringify(formCore.getValue())).toEqual(JSON.stringify({
            repeat: [],
        }));
    });

    it('filter works', async () => {
        const valuesArr = [
            { drawerName: '开票人' },
            { drawerName: '客户' },
            { drawerName: '拍档' },
            { drawerName: '销售' },
        ];

        form.find(InlineRepeater).instance().doAdd(valuesArr[0]);
        form.find(InlineRepeater).instance().doAdd(valuesArr[1]);
        form.find(InlineRepeater).instance().doAdd(valuesArr[2]);
        form.find(InlineRepeater).instance().doAdd(valuesArr[3]);
        form.mount();

        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify(valuesArr));
        expect(form.find('Input.repeater-search').length).toEqual(1);
        expect(form.find('div.repeater-row').length).toEqual(4);
        ReactTestUtils.Simulate.change(form.find('Input.repeater-search').getDOMNode(), {
            target: { value: 'hello world' },
        });
        await sleep(500);
        form.mount();
        expect(form.find('div.repeater-row').length).toEqual(0);

        ReactTestUtils.Simulate.change(form.find('Input.repeater-search').getDOMNode(), {
            target: { value: '客户' },
        });
        await sleep(500);
        form.mount();

        expect(form.find('div.repeater-row').length).toEqual(1);
        expect(form.find('div.repeater-row .next-table-cell-wrapper').at(0).prop('children')).toEqual('客户');

        ReactTestUtils.Simulate.change(form.find('Input.repeater-search').getDOMNode(), {
            target: { value: '' },
        });
        await sleep(500);
        form.mount();
        expect(form.find('div.repeater-row').length).toEqual(4);
    });
});
