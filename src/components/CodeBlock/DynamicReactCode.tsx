"use client";
import React, { useState } from "react";

export const DynamicReactCode = ({
	transpiledCode,
}: { transpiledCode: string }) => {
	const Component = executeComponent(transpiledCode);
	return <Component />;
};

// JSX を動的に評価してコンポーネントを作成
export const executeComponent = (jsxString: string): React.FC => {
	const Component = () => {
		const componentFunction = new Function(
			"React",
			"useState",
			`return ${jsxString}`,
		);

		return componentFunction(React, useState)();
	};

	return Component;
};

export const DynamicK4aReactCode = ({
	transpiledCode,
}: { transpiledCode: string }) => {
	const Component = executeK4aComponent(transpiledCode);
	return <Component />;
};

export const TaskTemplate = () => {
	return <div>TaskTemplate</div>;
};

export const executeK4aComponent = (jsxString: string): React.FC => {
	const Component = () => {
		const componentFunction = new Function(
			"React",
			"useState",
			"TaskTemplate",
			`return ${jsxString}`,
		);

		return componentFunction(React, useState, TaskTemplate)();
	};

	return Component;
};
