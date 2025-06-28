import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dompurify from 'dompurify';
import Image from 'next/image';

// Components
import Slider from 'rc-slider';
import CustomSkeleton from '../primitives/CustomSkeleton/CustomSkeleton';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { getRange, getTenure } from './utils';
import { trackEvent } from '../../utils/gtm';
import { ExtraInterestRate } from '../fd/FDCalculator/utils';

//Hooks
import { useAppSelector } from '../../redux/slices/hooks';

// Styles
import 'rc-slider/assets/index.css';
import styles from './FDGraph.module.css';

type FDGraphProps = {
  graphData: {
    options: { label: string; value: number }[];
    tenureByIntrest: { interest: number; options: any[] }[];
    scaleRange?: {
      min: number;
      max: number;
    };
    selectedOption?: number;
  };
  setTenure: (value: number) => void;
  graphLoading?: boolean;
  extraInterestRate: ExtraInterestRate;
};

const FDGraph = ({
  graphData,
  setTenure,
  graphLoading = false,
  extraInterestRate = null,
}: FDGraphProps) => {
  const [value, setValue] = useState(0);
  const router = useRouter();
  const sanitizer = dompurify.sanitize;

  const {
    options = [],
    tenureByIntrest = [],
    scaleRange = { min: 0, max: 10 },
    selectedOption = 0,
  } = graphData;

  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const { viewAssetDetailEventFields } = useAppSelector(
    (state) => state.monthlyCard
  );
  const { minAmount = 0 } = useAppSelector(
    (state) => (state as any)?.fdConfig?.fdCalculationMetaData ?? {}
  );

  const getBarByTenure = (tenure: string | number) => {
    const interest = getIntrestRate(tenure);
    const bar = bars.find((x) => x.interest === interest);
    return bar;
  };

  const previousTenureRef = useRef<number | null>(null);

  const handleChange = (value: number, changed_using: string) => {
    if (value < 0 || value >= options.length) {
      return;
    }
    const tenure = options?.[value]?.value;
    const previousTenure = previousTenureRef.current;
    previousTenureRef.current = tenure;

    const bar = getBarByTenure(tenure);
    setValue(value);
    setTenure(tenure);

    if (previousTenure != null && previousTenure != tenure) {
      trackEvent('FD Tenure Changed', {
        previous: getTenure(previousTenure),
        changed_to: getTenure(tenure),
        changed_using: changed_using,
        fd_name: asset?.name || '',
        fd_type: asset?.productSubcategory || '',
        asset_id: asset?.assetID || '',
      });
    }

    if (bar) {
      handleMouseEnter(bar);
    }
  };

  const handleTenureChange = (value) => {
    if (!Array.isArray(options)) {
      return 0;
    }

    for (let i = 0; i < options.length; i++) {
      const optionValue = parseInt(options[i].label.replace('M', ''));

      if (optionValue >= value) {
        return i;
      }
    }

    // If no options are greater than the value, return the last index
    return options.length - 1;
  };

  const [bars, setBars] = useState([]);
  const [marks, setMarks] = useState({});
  const yAxisMarks = [scaleRange.min + 1, scaleRange.max - 0.4];
  const horiztontalLines = [scaleRange.min + 1, scaleRange.max - 0.4];
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [crown, setCrown] = useState({} as any);
  const [toolTip, setToolTip] = useState({
    value: 0,
    left: '',
    bottom: '',
    visible: false,
    range: '',
    crown: false,
  });

  useEffect(() => {
    let bars = [];
    let corwn = {};
    let maxIntrest = 0;
    for (let x of tenureByIntrest) {
      // bar
      let bar = {
        height: `calc(${
          ((x.interest - scaleRange.min) / (scaleRange.max - scaleRange.min)) *
          100
        }% - 10px)`,
        width: x.options.length * (100 / options.length) + '%',
        interest: x.interest,
        left:
          bars.length === 0
            ? '0%'
            : `calc(${bars[bars.length - 1].left} + ${
                bars[bars.length - 1].width
              })`,
        options: x.options,
      };
      bars.push(bar);
      // crown
      if (x.interest > maxIntrest) {
        maxIntrest = x.interest;
        corwn = {
          bottom: `calc(${
            ((x.interest - scaleRange.min) /
              (scaleRange.max - scaleRange.min)) *
            100
          }% + 2px)`,
          left:
            bars.length === 0
              ? (x.options.length * (100 / options.length)) / 2 + '%'
              : `calc(${bars[bars.length - 1].left} + ${
                  (x.options.length * (100 / options.length)) / 2
                }% - 7px)`,
          option: x.options[0],
        };
      }
    }
    // y axis marks
    let marks = {};
    for (let i = 0; i < options.length; i++) {
      if (options[i].label) {
        marks[i] = {
          label: options[i].label,
          style: {
            whiteSpace: 'nowrap',
            fontSize: 8,
            marginLeft:
              i === options.length - 1
                ? `-${options[i].label.length * 2.5}px`
                : i === 0
                ? `${options[i].label.length * 2.5}px`
                : '0px',
          },
        };
      }
    }
    setCrown(corwn);
    setMarks(marks);
    setBars(bars);
    if (router.isReady) {
      const { tenure } = router.query;
      const purifiedTenure = sanitizer(tenure);
      const index = purifiedTenure ? handleTenureChange(purifiedTenure) : -1;
      handleChange(index !== -1 ? index : selectedOption, 'slider');
    } else {
      handleChange(selectedOption, 'slider');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, tenureByIntrest, router.isReady, router.query]);

  const filterRenderTrue = (obj) => {
    if (typeof obj !== 'object') {
      return [];
    }
    return Object.keys(obj).filter((key) => obj[key]?.render);
  };

  useEffect(() => {
    const currentPath = router.pathname;
    if (isInitialRender && !graphLoading) {
      if (
        Object.keys(asset?.assetMappingData?.calculationInputFields)?.length &&
        viewAssetDetailEventFields?.assetID &&
        currentPath === '/assetdetails'
      ) {
        const FdEventFields = { ...viewAssetDetailEventFields };
        FdEventFields['fd_name'] = asset?.spv?.vendorID ?? '';
        FdEventFields['fd_type'] = asset?.category ?? '';
        FdEventFields['min_investment'] = minAmount ?? 0;
        FdEventFields['max_interest'] =
          getIntrestRate(options?.[value]?.value) ?? 0;
        FdEventFields['extra return eligible'] =
          filterRenderTrue(extraInterestRate ?? {}) ?? [];
        const tenure = asset?.assetMappingData?.calculationInputFields?.tenure;
        const tenureType =
          asset?.assetMappingData?.calculationInputFields?.tenureType ?? '';
        FdEventFields['min_tenure'] = `${tenure} ${tenureType}`.trim();

        trackEvent('View Asset Details', {
          ...FdEventFields,
        });
      }

      setIsInitialRender(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    graphLoading,
    isInitialRender,
    viewAssetDetailEventFields?.assetID,
    router.pathname,
  ]);
  const renderVerticalLines = () => {
    return Array(9)
      .fill(null)
      .map((_, index) => (
        <div
          style={{
            width: `${index * 10 + 10}%`,
          }}
          className={styles.verticalLine}
          key={`vertical-line_${index}-${Date.now()}`}
        />
      ));
  };

  const handleBarClick = (bar: any) => {
    let index = options.findIndex((option) => option.value === bar.options[0]);
    handleChange(index, 'slider');
  };

  const handleCrownClick = () => {
    let index = options.findIndex((option) => option.value === crown.option);
    handleChange(index, 'slider');
  };

  const getIntrestRate = (value: string | number) => {
    let intrest = 0;
    for (let x of tenureByIntrest) {
      if (x.options.includes(value)) {
        intrest = x.interest;
        break;
      }
    }
    return intrest;
  };

  const handleMouseEnter = (bar: any) => {
    if (bar.options[0] === crown.option) {
      setToolTip({
        value: bar.interest,
        left: `calc(${crown.left} - 105px)`,
        bottom: crown.bottom,
        visible: true,
        range: getRange(bar.options),
        crown: true,
      });
    } else {
      setToolTip({
        value: bar.interest,
        left: `calc(${bar.left} + ${bar.width} / 2 - 50px)`,
        bottom: bar.height,
        visible: true,
        range: getRange(bar.options),
        crown: false,
      });
    }
  };

  const handleMouseLeave = (bar: any) => {
    setToolTip((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  if (options.length === 0 || tenureByIntrest.length === 0 || graphLoading) {
    return (
      <div className={`${styles.container} ${styles.SkeletonContainer}`}>
        <CustomSkeleton className={styles.Skeleton} />
      </div>
    );
  }
  return (
    <div className={styles.container} onDragStart={(e) => e.preventDefault()}>
      <div className={`flex justify-between items-center ${styles.header}`}>
        <div>
          <p className={styles.intrestRate}>
            {getIntrestRate(options?.[value]?.value)}%
          </p>
          <p className={styles.intrestRateLabel}>Interest Rate</p>
        </div>
        <div className="flex items-center">
          <div>
            <p className={styles.tenure}>
              {getTenure(options?.[value]?.value)}
            </p>
            <p className={styles.tenureLabel}>Tenure</p>
          </div>
          <div className={`flex-column ${styles.buttonsContainer}`}>
            <div
              className={styles.button}
              onClick={() => handleChange(value + 1, 'icon_button')}
            >
              +
            </div>
            <div
              className={styles.button}
              onClick={() => handleChange(value - 1, 'icon_button')}
            >
              -
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        <div className={styles.yAxis}>
          {yAxisMarks.map((mark, index) => (
            <span
              style={{
                bottom: `calc(${
                  ((mark - scaleRange.min) /
                    (scaleRange.max - scaleRange.min)) *
                  100
                }% - 5px)`,
              }}
              key={`mark-${options[index].label}`}
              className={styles.yMark}
            >
              {mark?.toFixed(2)}%
            </span>
          ))}
        </div>
        <div className={`${styles.Graph} flex items-end`}>
          {bars.map((bar) => (
            <div
              style={{
                height: bar.height,
                width: bar.width,
                backgroundColor: bar.options.includes(options?.[value]?.value)
                  ? '#00A3A2'
                  : '#9EDFDF',
                left: bar.left,
                zIndex: 1,
              }}
              key={`bar-${bar.interest}-${bar.left}` || `bar__${bar}`}
              className={`flex-column items-center ${styles.Bar}`}
              onClick={() => handleBarClick(bar)}
              onMouseEnter={() => handleMouseEnter(bar)}
              onMouseLeave={() => handleMouseLeave(bar)}
            />
          ))}
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}fd/crown.svg`}
            alt="crown"
            style={crown}
            className={styles.crown}
            onClick={handleCrownClick}
            height={14}
            width={14}
          />
          <span
            className={styles.tooltip}
            style={{
              left: toolTip.left,
              bottom: toolTip.bottom,
              opacity: toolTip.visible ? 1 : 0,
              borderColor: toolTip.crown ? '#6f37e5' : '#e5ebf2',
            }}
          >
            {toolTip.value}%&nbsp;
            <span className={styles.range}>|&nbsp;{toolTip.range}</span>
          </span>
          {horiztontalLines.map((x, i) => (
            <div
              style={{
                height: `calc(${
                  ((x - scaleRange.min) / (scaleRange.max - scaleRange.min)) *
                  100
                }%)`,
                borderTop: `1px solid rgba(181, 181, 181, ${1 - x / 10})`,
              }}
              className={styles.horizontalLine}
              key={`horizontal-line-${x}`}
            />
          ))}
          {renderVerticalLines()}
          <Slider
            value={value}
            onChange={(changeValue) =>
              handleChange(changeValue as number, 'slider')
            }
            min={0}
            max={options.length - 1}
            step={1}
            className={styles.Slider}
            marks={marks}
            dotStyle={{ display: 'none' }}
            styles={{
              track: { backgroundColor: '#00357C', height: 10 },
              rail: { height: 10 },
              handle: {
                backgroundColor: '#00357C',
                border: '4px solid #FFFFFF',
                boxShadow: '0px 0px 0px 8px rgb(255, 255, 255, 0.8) !important',
                width: 20,
                height: 20,
                opacity: 1,
              },
            }}
          />
        </div>
      </div>
      <div className={styles.Tenure}>Choose Tenure</div>
    </div>
  );
};

export default FDGraph;
