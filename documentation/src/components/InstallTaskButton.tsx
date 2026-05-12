import React, { JSX, useEffect, useLayoutEffect } from 'react';
import { getEnvPaths } from '../models/Paths';
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import QRCode from "react-qr-code";

type TUserAgentWithUAData = Navigator & { userAgentData?: { mobile: boolean } };

interface InstallTaskButtonProps {
	ftdFileName: string;
	showQrCode?: boolean;
	style?: React.CSSProperties;
}

interface InstallOption {
	title: string;
	url: string;
	target: string;
	showQrCode?: boolean;
}

export default function InstallTaskButton({
	ftdFileName, showQrCode = false, style = {}
}: InstallTaskButtonProps) {
	

	const [open, setOpen] = React.useState(false);
	const buttonGrpRef = React.useRef<HTMLDivElement>(null);
	const [buttonWidth, setButtonWidth] = React.useState<number | null>(null);
	const [selectedIndex, setSelectedIndex] = React.useState(1);
	const [activeOption, setActiveOption] = React.useState<InstallOption>(
		{ title: '', url: '', target: '' });
	const [optionList, setOptionList] = React.useState<InstallOption[]>([]);

	const [qrCodeElement, setQrCodeElement] = React.useState<JSX.Element | null>(null);
	
	const isAndroid = (() => {
		
		if( typeof navigator === 'undefined' || typeof window === 'undefined' ) {
			return false;
		}

		const navigatorWithUAData = navigator as TUserAgentWithUAData;
		const isAndroidOptions: boolean[] = [
			typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent),
			navigatorWithUAData.userAgentData ? navigatorWithUAData.userAgentData.mobile : false,
			window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false
		];

		return isAndroidOptions.some(v => v);
	})();

	useEffect(() => {

		if (!ftdFileName) {
			return;
		}
		
		
		const envPaths = getEnvPaths();
		const ftdPath = ftdFileName.startsWith("http") 
			? ftdFileName
			: envPaths.repo + ftdFileName;

		const androidPrefix = `${envPaths.appAndroid}://open?`;
		const webPrefix = `${envPaths.appWeb}?`;
		const suffix = `INSTALL_TASK=${encodeURIComponent(ftdPath)}`;

		let optionList= [
			{ title: 'Install to Web', 		url: webPrefix + suffix, 		target: "figaro:app" },
			{ title: 'Install to Android', 	url: androidPrefix + suffix,	target: "_self",		showQrCode: true },
			{ title: 'Open FTD in new tab', url: ftdPath, 					target: "_blank" }
		];

		setOptionList(optionList);
		
		
		setActiveOption(optionList[isAndroid ? 1 : 0]);

	}, [ftdFileName]);

	useLayoutEffect(() => {

		if (buttonGrpRef.current) {
			setButtonWidth(buttonGrpRef.current.clientWidth);
		}

	}, [activeOption]);

	useEffect(() => {

		if( !showQrCode || activeOption.showQrCode !== true || isAndroid ) {
			setQrCodeElement(null);
			return;
		}

		const widthStyle = buttonWidth ? `${buttonWidth}px` : undefined;

		const qrCodeElement = 
			<QRCode
				style={{ height: "auto", width: widthStyle ? widthStyle : "100%", marginTop: '0.5rem' }}
				value={activeOption.url}
				viewBox={`0 0 100 100`}
			/>

		setQrCodeElement(qrCodeElement);
	}, [activeOption, buttonWidth, showQrCode]);

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
			buttonGrpRef.current &&
			buttonGrpRef.current.contains(event.target as HTMLElement)
		) {
			return;
		}

		setOpen(false);
	};

	return (
		<div>
			<div style={{ display: 'flex', flexDirection: 'column', ...style }}>
				<ButtonGroup
					variant="contained"
					ref={buttonGrpRef}
					aria-label="Button group with a nested menu"
				>
					<Button 
						onClick={handleClick}
					>{activeOption.title}</Button>
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
					anchorEl={buttonGrpRef.current}
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

				<div style={{ textAlign: 'right' }}>
					{showQrCode && qrCodeElement}
				</div>
			</div>
			
		</div>
	);
}