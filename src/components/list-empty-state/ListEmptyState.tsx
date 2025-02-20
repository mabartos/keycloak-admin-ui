import React, { MouseEventHandler } from "react";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
  Button,
  ButtonVariant,
  EmptyStateSecondaryActions,
} from "@patternfly/react-core";
import { SVGIconProps } from "@patternfly/react-icons/dist/js/createIcon";
import { PlusCircleIcon } from "@patternfly/react-icons";
import { SearchIcon } from "@patternfly/react-icons";

export type Action = {
  text: string;
  type?: ButtonVariant;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export type ListEmptyStateProps = {
  message: string;
  instructions: React.ReactNode;
  primaryActionText?: string;
  onPrimaryAction?: MouseEventHandler<HTMLButtonElement>;
  hasIcon?: boolean;
  icon?: React.ComponentClass<SVGIconProps>;
  isSearchVariant?: boolean;
  secondaryActions?: Action[];
};

export const ListEmptyState = ({
  message,
  instructions,
  onPrimaryAction,
  hasIcon = true,
  isSearchVariant,
  primaryActionText,
  secondaryActions,
  icon,
}: ListEmptyStateProps) => {
  return (
    <>
      <EmptyState data-testid="empty-state" variant="large">
        {hasIcon && isSearchVariant ? (
          <EmptyStateIcon icon={SearchIcon} />
        ) : (
          hasIcon && <EmptyStateIcon icon={icon ? icon : PlusCircleIcon} />
        )}
        <Title headingLevel="h4" size="lg">
          {message}
        </Title>
        <EmptyStateBody>{instructions}</EmptyStateBody>
        {primaryActionText && (
          <Button
            data-testid="empty-primary-action"
            variant="primary"
            onClick={onPrimaryAction}
          >
            {primaryActionText}
          </Button>
        )}
        {secondaryActions && (
          <EmptyStateSecondaryActions>
            {secondaryActions.map((action) => (
              <Button
                key={action.text}
                variant={action.type || ButtonVariant.secondary}
                onClick={action.onClick}
              >
                {action.text}
              </Button>
            ))}
          </EmptyStateSecondaryActions>
        )}
      </EmptyState>
    </>
  );
};
