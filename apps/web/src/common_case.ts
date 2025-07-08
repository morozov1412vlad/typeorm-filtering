// General concepts.
// Application should be split into data management layer and presentation layer.
// Components shouldn't care where data comes from, where it goes to or how it is processed.
// In most cases API has two interfaces per entity: response and request.
// Components shouldn't care about these interfaces, they should only work
// with one unified local state interface.
// *Notes:
// - In some cases we might want to have more then one response/request/local interface per entity because of:
//   a) GET by id and GET list interfaces are different
//   b) When object is nested in another object
// - There could be additional form interface(s) for entities that have some fields nullable and validated form interface(s).
//   This interface will exist only in scope of a form, then it will be validated and converted into request interface.

import { useCallback, useMemo, useState, useEffect } from 'react';

interface ListResponse<T> {
  data: T[];
  next: string | null;
  previous: string | null;
  count: number;
}

type APIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  accountType: 'free' | 'premium';
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
  account_type: 'free' | 'premium';
}

interface UserRequest {
  name: string;
  email: string;
  account_type: 'free' | 'premium';
}

interface UserForm {
  name: string;
  email: string;
  accountType: 'free' | 'premium' | null;
}

interface UserFormValidated {
  name: string;
  email: string;
  accountType: 'free' | 'premium';
}

class UserAPI {
  private readonly baseUrl = '/api/users';

  async create(request: UserRequest): Promise<APIResponse<UserResponse>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async update(
    id: string,
    request: UserRequest,
  ): Promise<APIResponse<UserResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(request),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async delete(id: string): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getById(id: string): Promise<APIResponse<UserResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getList(
    page?: string,
  ): Promise<APIResponse<ListResponse<UserResponse>>> {
    const url = page || this.baseUrl;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

const useUserTransform = () => {
  const responseToState = (response: UserResponse): User => {
    return {
      id: response.id,
      name: response.name,
      email: response.email,
      createdAt: new Date(response.created_at),
      accountType: response.account_type,
    };
  };

  const formStateToRequest = (state: UserFormValidated): UserRequest => {
    try {
      if (!state.name || !state.email || !state.accountType) {
        throw new Error('Name, email and account type are required');
      }
      return {
        name: state.name,
        email: state.email,
        account_type: state.accountType,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return { responseToState, formStateToRequest };
};

const useUser = (id?: string) => {
  const api = useMemo(() => new UserAPI(), []);
  const { responseToState, formStateToRequest } = useUserTransform();

  const getById = useCallback(
    async (userId: string) => {
      const _id = id || userId;
      if (!_id) {
        throw new Error('User ID is required');
      }
      const response = await api.getById(_id);
      if (response.success) {
        return responseToState(response.data);
      }
      throw new Error(response.error);
    },
    [id, api, responseToState],
  );

  const save = useCallback(
    async (state: UserFormValidated) => {
      try {
        const request = formStateToRequest(state);
        const response = id
          ? await api.update(id, request)
          : await api.create(request);
        if (response.success) {
          return responseToState(response.data);
        }
        throw new Error(response.error);
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    },
    [id, api, responseToState, formStateToRequest],
  );

  return { getById, save };
};

const useUserForm = () => {
  const [state, setState] = useState<UserForm>({
    name: '',
    email: '',
    accountType: null,
  });

  const handleChange = <T extends keyof UserForm>(
    key: T,
    value: UserForm[T],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  return { state, handleChange };
};

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useMemo(() => new UserAPI(), []);
  const { responseToState } = useUserTransform();

  useEffect(() => {
    const fetchUsers = async (page?: string) => {
      try {
        const response = await api.getList(page);
        if (response.success) {
          setUsers((prev) => [
            ...prev,
            ...response.data.data.map(responseToState),
          ]);
          if (response.data.next) {
            fetchUsers(response.data.next);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    setLoading(true);
    fetchUsers();
  }, [api, responseToState]);

  return { users, loading, error };
};
