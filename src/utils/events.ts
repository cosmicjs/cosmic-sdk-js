/**
 * Browser-compatible EventEmitter implementation
 * This provides the same API as Node.js EventEmitter but works in browser environments
 */
export class EventEmitter {
  private events: Record<string, Function[]> = {};

  on(event: string, listener: Function): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events[event];
    if (!listeners || listeners.length === 0) {
      return false;
    }

    listeners.forEach((listener) => {
      try {
        listener.apply(this, args);
      } catch (error) {
        // In a production environment, you might want to handle this differently
        console.error('Error in event listener:', error);
      }
    });

    return true;
  }

  off(event: string, listener?: Function): this {
    if (!listener) {
      delete this.events[event];
      return this;
    }

    const listeners = this.events[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      if (listeners.length === 0) {
        delete this.events[event];
      }
    }
    return this;
  }

  removeListener(event: string, listener: Function): this {
    return this.off(event, listener);
  }

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  listeners(event: string): Function[] {
    const eventListeners = this.events[event];
    return eventListeners ? [...eventListeners] : [];
  }

  listenerCount(event: string): number {
    const eventListeners = this.events[event];
    return eventListeners ? eventListeners.length : 0;
  }

  once(event: string, listener: Function): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    return this.on(event, onceWrapper);
  }
}
