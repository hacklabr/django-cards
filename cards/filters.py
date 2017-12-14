from rest_framework import filters

class CardsSearchFilter(filters.SearchFilter):
    def get_search_terms(self, request):
        params = request.query_params.get(self.search_param, '')
        params = params.replace("%3B", ';')
        return params.replace(',', ' ').split()