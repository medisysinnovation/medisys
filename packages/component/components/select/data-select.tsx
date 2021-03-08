import React, { useEffect, useState, useMemo } from 'react';
import { useEventListener } from 'ahooks';
import { Select } from 'antd';
import { SelectProps, RefSelectProps, SelectValue } from 'antd/es/select';
import { MIConfig, GET } from '@medisys/utils';

export interface MIDataSelectProps<VT> extends SelectProps<VT> {
  code?: string;
  url?: string;
  text?: boolean;
  valueField?: string;
  displayField?: string;
  dataSource?: object[];
  dataSourceLoader?: (code: string, params?: any) => Promise<object[]>;
  filter?: (options: object[]) => object[];
  filterRule?: CodeTableSelectFilterRule | CodeTableSelectFilterRule.Contains;
  onChange?: (value: VT, option: object) => void;
}

export enum CodeTableSelectFilterRule {
  StartsWidth,
  Contains,
}

const { Option } = Select;
const codeLoading: { [key: string]: boolean } = {};

const MIDataSelect = <VT extends SelectValue = SelectValue>(
  {
    code,
    valueField = 'id',
    displayField = 'text',
    children,
    dataSource,
    dataSourceLoader,
    filter,
    filterRule,
    url,
    text,
    onChange,
    ...restProps
  }: MIDataSelectProps<VT>,
  ref: React.Ref<RefSelectProps>,
) => {
  const [list, setList] = useState<object[]>([]);
  const [filteredList, setFilteredList] = useState<object[]>([]);

  const [dataSourceLoading, setDataSourceLoading] = useState(false);

  useEventListener('mi_datasourcechanged_' + code, (e: CustomEvent) => {
    setList(e.detail ?? []);
    setDataSourceLoading(false);
  });

  useEffect(() => {
    if (code) {
      const existList = MIConfig.getData(code);

      if (existList.length > 0) {
        setList(existList);
        return;
      }
      if (!url) {
        // MIConfig.
        if (list.length) {
          return;
        }

        if (dataSourceLoader) {
          dataSourceLoader(code).then(newData => {
            setList(newData);
          });
        } else {
          setDataSourceLoading(true);
          MIConfig.loadData(code);
        }
        // config.load({ code });
      }
    }
  }, []);

  useEffect(() => {
    if (url) {
      if (code) {
        const existList = MIConfig.getData(code);

        if (existList.length > 0) {
          setList(existList);
          return;
        }
      }

      setDataSourceLoading(true);
      if (!code || !codeLoading[code]) {
        if (code) {
          codeLoading[code] = true;
        }

        GET(url, { pageSize: 9999 }).then((result: any) => {
          const data = result?.data;
          if (code) {
            delete codeLoading[code];
            MIConfig.updateState({
              dataSource: {
                [code]: data ?? [],
              },
            });
          } else {
            setDataSourceLoading(false);
            setList(data);
          }
        });
      }
    }
  }, [url]);

  useEffect(() => {
    if (dataSource) {
      setList(dataSource);
    }
  }, [dataSource]);

  useEffect(() => {
    if (typeof filter === 'function') {
      setFilteredList(list.filter(filter));
    } else {
      setFilteredList(list);
    }
  }, [list]);

  const handleFilter = useMemo(() => {
    return (input: string, option: any) => {
      if (filterRule === CodeTableSelectFilterRule.Contains)
        return (
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
      return option?.children?.toLowerCase().startsWith(input.toLowerCase());
    };
  }, [filterRule]);

  const handleOnChange = (value: VT, option: Object) => {
    const opt = filteredList.find((opt: any) => opt[valueField] === value);
    onChange && onChange(value, { ...option, data: opt });
  };

  if (text) {
    const option = filteredList.find(
      (opt: { [key: string]: string }) =>
        //@ts-ignore
        opt[valueField || 'id'] === restProps.value,
    );
    //@ts-ignore
    if (option) return <span>{option[displayField || 'name']}</span>;
    return null;
  }

  // console.log(list);
  return (
    <Select
      ref={ref}
      loading={dataSourceLoading}
      // showSearch
      style={{ minWidth: 100 }}
      filterOption={handleFilter}
      // placeholder="Select a person"
      // optionFilterProp="children"
      {...restProps}
      onChange={handleOnChange}
    >
      {children
        ? children
        : filteredList.map((o: { [index: string]: string }) => (
            <Option key={o[valueField]} value={o[valueField]}>
              {o[displayField]}
            </Option>
          ))}
    </Select>
  );
};

export default MIDataSelect;
