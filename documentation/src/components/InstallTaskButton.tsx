import React, { useEffect } from 'react';
import { getEnvPaths } from '../models/Paths';
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';

type TUserAgentWithUAData = Navigator & { userAgentData?: { mobile: boolean } };

interface InstallTaskButtonProps {
	ftdFileName: string;
}

interface InstallOption {
	title: string;
	url: string;
	target: string;
}

export default function InstallTaskButton({
	ftdFileName
}: InstallTaskButtonProps) {
	

	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef<HTMLDivElement>(null);
	const [selectedIndex, setSelectedIndex] = React.useState(1);
	const [activeOption, setActiveOption] = React.useState<InstallOption>(
		{ title: '', url: '', target: '' });
	const [optionList, setOptionList] = React.useState<InstallOption[]>([]);

	useEffect(() => {

		if (!ftdFileName) {
			return;
		}
		
		
		const envPaths = getEnvPaths();
		const ftdPath = envPaths.repo + ftdFileName;

		const androidPrefix = `${envPaths.appAndroid}://open?`;
		const webPrefix = `${envPaths.appWeb}?`;
		const suffix = `INSTALL_TASK=${encodeURIComponent(ftdPath)}`;

		let optionList= [
			{ title: 'Install to Web', url: webPrefix + suffix, target: "figaro:app" },
			{ title: 'Install to Android App', url: androidPrefix + suffix, target: "_self" },
			{ title: 'Open FTD in new tab', url: ftdPath, target: "_blank" }
		];

		setOptionList(optionList);
		const navigatorWithUAData = navigator as TUserAgentWithUAData;
		const isAndroidOptions: boolean[] = [
			typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent),
			navigatorWithUAData.userAgentData ? navigatorWithUAData.userAgentData.mobile : false,
			window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false
		];

		const isAndroid = isAndroidOptions.some(v => v);
		
		
		
		if (isAndroid) {
			optionList = [optionList[1], optionList[0], optionList[2]]; // Android option first
		} else {
			optionList = [optionList[0], optionList[1], optionList[2]]; // Web option first
		}

		setActiveOption(optionList[0]);

	}, [ftdFileName]);

	

	const handleClick = () => {
		window.open(activeOption.url, activeOption.target);
	};

	const handleMenuItemClick = (
		event: React.MouseEvent<HTMLLIElement, MouseEvent>,
		index: number,
	) => {
		setSelectedIndex(index);
		setActiveOption(optionList[index]);
		setOpen(false);
	};

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	const handleClose = (event: Event) => {
		if (
			anchorRef.current &&
			anchorRef.current.contains(event.target as HTMLElement)
		) {
			return;
		}

		setOpen(false);
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<ButtonGroup
				variant="contained"
				ref={anchorRef}
				aria-label="Button group with a nested menu"
			>
				<Button onClick={handleClick}>{activeOption.title}</Button>
				<Button
					size="small"
					aria-controls={open ? 'split-button-menu' : undefined}
					aria-expanded={open ? 'true' : undefined}
					aria-label="select merge strategy"
					aria-haspopup="menu"
					onClick={handleToggle}
				>
					<ArrowDropDownIcon />
				</Button>
			</ButtonGroup>
			<Popper
				sx={{ zIndex: 1 }}
				open={open}
				anchorEl={anchorRef.current}
				role={undefined}
				transition
				disablePortal
			>
				{({ TransitionProps, placement }) => (
					<Grow
						{...TransitionProps}
						style={{
							transformOrigin:
								placement === 'bottom' ? 'center top' : 'center bottom',
						}}
					>
						<Paper>
							<ClickAwayListener onClickAway={handleClose}>
								<MenuList id="split-button-menu" autoFocusItem>
									{optionList.map((option, index) => (
										<MenuItem
											key={option.title}
											//disabled={index === 2}
											selected={index === selectedIndex}
											onClick={(event) => handleMenuItemClick(event, index)}
										>
											{option.title}
										</MenuItem>
									))}
								</MenuList>
							</ClickAwayListener>
						</Paper>
					</Grow>
				)}
			</Popper>
		</div>
	);
}