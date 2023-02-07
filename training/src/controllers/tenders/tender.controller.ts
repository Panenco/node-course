import { TenderBody } from './../../contracts/bodies/tender.body';
import { getTender } from './handlers/getTender.handler';
import { Body, ListRepresenter, Representer, StatusCode } from "@panenco/papi";
import { Authorized, Delete, Get, JsonController, Param, Patch, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { TenderView } from "../../contracts/views/tender.view";
import { updateTender } from './handlers/updateTender.handler';
import { deleteTender } from './handlers/deleteTender.handler';
import { RequestView } from '../../contracts/views/request.view';
import { RequestBody } from '../../contracts/bodies/request.body';
import { createRequest } from './handlers/createRequest.handler';
import { getRequests } from './handlers/getRequests.handler';

@JsonController('/tenders')
@Authorized()
export class TenderController {
  @Get('/:id')
  @OpenAPI({ summary: 'Get tender' })
  @Representer(TenderView)
  async getTender (@Param("id") id: string) {
    return getTender(id);
  }

  @Patch('/:id')
  @OpenAPI({ summary: 'Update tender' })
  @Representer(TenderView)
  async updateTender(
    @Body({}, { skipMissingProperties: true }) body: TenderBody, 
    @Param("id") id: string
  ) {
    return updateTender(body, id);
  }

  @Delete('/:id')
  @OpenAPI({ summary: 'Delete tender' })
  @Representer(null, StatusCode.noContent)
  async deleteTender(@Param("id") id: string) {
    return deleteTender(id);
  }

  @Post('/:id/requests')
  @OpenAPI({ summary: 'Create request' })
  @Representer(RequestView)
  async createRequest (@Param("id") id: string, @Body() requestBody: RequestBody) {
    return createRequest(requestBody, id);
  }

  @Get('/:id/requests')
  @OpenAPI({ summary: 'Get requests' })
  @ListRepresenter(RequestView)
  async getRequests (@Param("id") id: string) {
    return getRequests(id);
  }
}