export type BaseCustomThemeProps = {
  root?: {
    fontFamily?: string
    primaryColor?: string
    dangerColor?: string
    warningColor?: string
    successColor?: string
    /**
      For a more cohesive aesthetic, use the same color for your Action and Primary color.
      */
    actionColor?: string
    borderColor?: string
    buttonBorderRadius?: string
    badgeBorderColor?: string
    badgeBorderRadius?: string
    checkboxBorderColor?: string
    checkboxBorderRadius?: string
    /**
     The border color for all dropdowns, text inputs, and context menus.
     */
    interactiveBorderColor?: string
    /**
     The border radius for all dropdowns, text inputs, and context menus.
     */
    interactiveBorderRadius?: string
    tabstripActiveColor?: string
    tabstripInactiveColor?: string
    tabstripHoverTextColor?: string
    tabstripHoverBorderColor?: string
    modalBorderRadius?: string
    pillBorderRadius?: string
    popoverBackgroundColor?: string
    popoverBorderRadius?: string
    tooltipBackgroundColor?: string
  }
  sidebar?: {
    /**
     * We validate that this is a real image before rendering
     */
    logo?: string
    textColor?: string
    titleColor?: string
    focusBgColor?: string
    focusTextColor?: string
    backgroundColor?: string
    footerTextColor?: string
    /**
     * @deprecated no longer in use
     */
    textUltralightColor?: string
    borderColor?: string
  }
  document?: {
    borderColor?: string
  }
  table: Partial<BaseCustomTableThemeProps>
  /**
   * Only available on pro plans and above
   */
  email?: {
    logo?: string
    textColor?: string
    titleColor?: string
    buttonBgColor?: string
    buttonTextColor?: string
    footerTextColor?: string
    backgroundColor?: string
  }
}

export type BaseCustomTableThemeProps = {
  inputs: {
    radio: {
      color?: string
    }
    checkbox: {
      color?: string
      borderColor?: string
    }
  }

  filters: {
    color: string
    /**
     * The border radius of the table filters
     */
    outerBorderRadius?: string
    /**
     * The border radius for the individual filters
     */
    innerBorderRadius?: string
    /**
     * defaults to none
     */
    outerBorder?: string
    active: {
      backgroundColor: string
    }
    error: {
      activeBackgroundColor: string
    }
  }

  buttons?: {
    iconColor?: string
    pill?: {
      color?: string
      backgroundColor?: string
    }
  }

  column: {
    header: {
      fontSize: string
      backgroundColor: string
      color: string
      dragHandle: {
        idle: string
        dragging: string
      }
    }
  }

  fontFamily: string

  indexColumn: {
    backgroundColor: string
    color?: string
    selected: {
      color: string
      backgroundColor: string
    }
  }

  cell: {
    selected: {
      backgroundColor: string
    }
    active: {
      borderColor: string
      spinnerColor: string
      borderWidth?: string
      borderShadow?: string
    }
  }

  boolean: {
    toggleChecked: string
  }

  loading: {
    color: string
  }
}

export const BaseCustomTheme: Partial<BaseCustomTableThemeProps> = {
  inputs: {
    radio: {
      color: '',
    },
    checkbox: {
      color: '',
    },
  },

  filters: {
    color: '',
    active: {
      backgroundColor: '',
    },
    error: {
      activeBackgroundColor: '',
    },
  },

  column: {
    header: {
      fontSize: '',
      backgroundColor: '',
      color: '',
      dragHandle: {
        idle: '',
        dragging: '',
      },
    },
  },

  indexColumn: {
    backgroundColor: '',
    selected: {
      color: '',
      backgroundColor: '',
    },
  },

  cell: {
    selected: {
      backgroundColor: '',
    },
    active: {
      borderColor: '',
      spinnerColor: '',
    },
  },

  boolean: {
    toggleChecked: '',
  },

  loading: {
    color: '',
  },
}
