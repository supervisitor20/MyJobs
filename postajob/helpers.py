def can_modify(user, company, kwargs, update_activity, create_activity):
    """
    Checks if user has update permission when a pk is available, otherwise
    checks for create permission.

    Inputs:
        :user: User to check activities against
        :company: The company being accessed.
        :kwargs: The keyword arguments passed to the view using this helper.
        :update_activity: The activity to check when the user wants to perform
                          an update action.
        :create_activity: The activity to check when the user wants to perform
                          a create action.

    Output:
        A boolean representing whether or not they had permission to perform
        the particular set of actions.

    Example::

        if not can_modify(user, company, kwargs, "update job", "create job"):
            return MissingActivity()

        retunr HttpResponse("Success")

    """
    if 'pk' in kwargs:
        return user.can(company, update_activity)
    else:
        return user.can(company, create_activity)
