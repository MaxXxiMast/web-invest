import { render } from '@testing-library/react';
import CircularProgressMeter from './CircularProgressMeter';

describe('CircularProgressMeter Component', () => {
    test('should render with default size and thickness', () => {
        const { container } = render(<CircularProgressMeter />);
        
        const progressLoaders = container.querySelectorAll('.MuiCircularProgress-root');
        
        progressLoaders.forEach((loader) => {
            expect(loader).toHaveAttribute('style', expect.stringContaining('32px'));
        });
    });

    test('should render with custom size, thickness, and progress colors', () => {
        const customSize = 60;
        const customThickness = 10;
        const progressColor="red"
        const progressMeterColor="grey" 

        const { container } = render(
            <CircularProgressMeter 
                size={customSize} 
                thickness={customThickness}
                progressColor={progressColor}
                progressMeterColor={progressMeterColor}
            />
        );

        const progressLoaders = container.querySelectorAll('.MuiCircularProgress-root');

        progressLoaders.forEach((loader) => {
            expect(loader).toHaveAttribute('style', expect.stringContaining(`${customSize}px`));
        });
    });
});
