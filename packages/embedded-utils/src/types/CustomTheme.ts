export type BaseCustomThemeProps = {
  root?: {
    primaryColor?: string
    dangerColor?: string
    warningColor?: string
  }
  sidebar?: {
    /**
     * We validate that this is a real image before rendering
     */
    logo?: string
    textColor: string
    titleColor: string
    focusBgColor: string
    focusTextColor: string
    backgroundColor: string
    footerTextColor: string
    textUltralightColor: string
  }
  table: Partial<BaseCustomTableThemeProps>
}

export type BaseCustomTableThemeProps = {
  inputs: {
    radio: {
      color?: string
    }
    checkbox: {
      color?: string
    }
  }

  filters: {
    color: string
    active: {
      backgroundColor: string
    }
    error: {
      activeBackgroundColor: string
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
